import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { randomBytes, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { Writable } from "node:stream";
import { test } from "node:test";

const blobs = new Map();
const pagamentos = [];
let versao = 0;
globalThis.cuponsTeste = { blobs, pagamentos, novaVersao: () => String(++versao) };

const blobFalso = `
  const { blobs, novaVersao } = globalThis.cuponsTeste;
  export class BlobPreconditionFailedError extends Error {}
  export async function get(path) {
    const entrada = blobs.get(path);
    return entrada ? { statusCode: 200, blob: { etag: entrada.etag }, stream: new Response(entrada.valor).body } : null;
  }
  export async function put(path, valor, opcoes = {}) {
    const anterior = blobs.get(path);
    if (opcoes.ifMatch && anterior?.etag !== opcoes.ifMatch) throw new BlobPreconditionFailedError();
    if (anterior && !opcoes.allowOverwrite) throw new Error("Blob existente");
    blobs.set(path, { valor, etag: novaVersao() });
    return { pathname: path };
  }
  export async function list({ prefix }) {
    return { blobs: [...blobs.keys()].filter(x => x.startsWith(prefix)).map(pathname => ({ pathname })) };
  }
`;
const stripeFalso = `
  export default class Stripe {
    checkout = { sessions: {
      create: async dados => {
        globalThis.cuponsTeste.pagamentos.push(dados);
        return { url: "https://checkout.stripe.test/session" };
      },
      retrieve: async () => ({ payment_status: "paid", metadata: { id: "outro-orcamento" } })
    }};
  }
`;
const modulos = new Map([["@vercel/blob", blobFalso], ["stripe", stripeFalso]]);
if (process.env.ORCAMENTO_CHROME) {
  modulos.set("@sparticuz/chromium", `export default {
    args: ["--remote-debugging-pipe", "--no-sandbox"],
    executablePath: async () => process.env.ORCAMENTO_CHROME
  };`);
}
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!modulos.has(specifier)) return nextResolve(specifier, context);
    return { url: "data:text/javascript;base64," + Buffer.from(modulos.get(specifier)).toString("base64"), shortCircuit: true };
  },
});

const origem = "https://painel.exemplo.test";
process.env.CUPONS_ADMIN_ORIGIN = origem;
process.env.CUPONS_ADMIN_SETUP = randomBytes(32).toString("base64url");
const senha = randomBytes(32).toString("base64url");
const segredo = () => randomBytes(32).toString("base64url");

const [
  { default: painel }, { default: validar }, { default: checkout },
  { default: download }, { criarCupom, consultarCupom, registrarUso }, { obterPedidoCupom },
] = await Promise.all([
  import("../api/painel-cupons.js"), import("../api/validar-cupom.js"),
  import("../api/criar-checkout.js"), import("../api/gerar-pdfs.js"),
  import("../lib/cupons.js"), import("../lib/pedido-cupom.js"),
]);

async function requisitar(funcao, { body, method = "POST", headers = {}, query = {} } = {}) {
  const resposta = {
    codigo: 200, headers: {},
    setHeader(nome, valor) { this.headers[nome.toLowerCase()] = valor; },
    status(valor) { this.codigo = valor; return this; },
    json(valor) { this.conteudo = valor; return this; },
    end(valor) { this.conteudo = valor; return this; },
  };
  await funcao({
    method, body, query,
    headers: { host: "painel.exemplo.test", origin: origem, "content-type": "application/json", ...headers },
  }, resposta);
  return resposta;
}

const admin = (acao, outros = {}, cookie = "") => requisitar(painel, { body: { acao, ...outros }, headers: { cookie } });
const cookieDe = resposta => resposta.headers["set-cookie"].split(";")[0];

test("painel exige origem, convite, aparelho cadastrado e senha; permite revogar", async () => {
  assert.equal((await requisitar(painel, { method: "GET", headers: { host: "site-publico.test" } })).codigo, 404);
  const tela = await requisitar(painel, { method: "GET" });
  assert.match(tela.conteudo, /Configurar o primeiro aparelho/);
  assert.match(tela.headers["content-security-policy"], /frame-ancestors 'none'/);
  assert.equal((await requisitar(painel, { body: { acao: "estado" }, headers: { origin: "https://outro.test" } })).codigo, 404);
  assert.equal((await admin("criar", { nome: "", dias: 7, limite: 3 })).codigo, 401);
  assert.equal((await admin("cadastrar", { nome: "Outro", senha, convite: segredo() })).codigo, 401);
  const cadastro = await admin("cadastrar", { nome: "Computador", senha, convite: process.env.CUPONS_ADMIN_SETUP });
  assert.equal(cadastro.codigo, 200);
  assert.match(cadastro.headers["set-cookie"], /HttpOnly; Secure; SameSite=Strict/);
  const aparelho = cookieDe(cadastro);
  assert.equal((await admin("entrar", { senha })).codigo, 401);
  assert.equal((await admin("entrar", { senha: "incorreta" }, aparelho)).codigo, 401);
  const login = await admin("entrar", { senha }, aparelho);
  const sessao = cookieDe(login);
  assert.equal((await admin("listar", {}, sessao)).codigo, 401);
  const acesso = aparelho + "; " + sessao;
  const cupom = await admin("criar", { nome: "Divulgação", dias: 7, limite: 3 }, acesso);
  assert.equal(cupom.codigo, 200);
  assert.match(cupom.conteudo.codigo, /^OF-(?:[A-F0-9]{8}-){2}[A-F0-9]{8}$/);
  const convite = (await admin("convidar", {}, acesso)).conteudo.convite;
  const dados = { nome: "Celular", convite, senha };
  const segundo = await admin("cadastrar", dados);
  assert.equal(segundo.codigo, 200);
  assert.equal((await admin("cadastrar", dados)).codigo, 401);
  const celular = cookieDe(segundo);
  const sessaoCelular = cookieDe(await admin("entrar", { senha }, celular));
  const lista = (await admin("listar", {}, acesso)).conteudo;
  const id = lista.aparelhos.find(x => x.nome === "Celular").id;
  assert.equal((await admin("revogar-aparelho", { id }, acesso)).codigo, 200);
  assert.equal((await admin("listar", {}, celular + "; " + sessaoCelular)).codigo, 401);
  assert.equal((await admin("revogar-cupom", { id: lista.cupons[0].id }, acesso)).codigo, 200);
  assert.equal((await requisitar(validar, { body: { codigo: cupom.conteudo.codigo } })).codigo, 400);
  assert.equal((await admin("sair", {}, acesso)).codigo, 200);
  assert.equal((await admin("listar", {}, acesso)).codigo, 401);
});

test("limite simultâneo e renovação à meia-noite de Brasília", async () => {
  const inicio = Date.parse("2026-11-21T02:59:00Z");
  const { codigo, expira } = await criarCupom({ nome: "Concorrência", dias: 7, limite: 3 }, inicio);
  const pedidos = Array.from({ length: 7 }, () => randomUUID());
  const tentativas = await Promise.allSettled(pedidos.map(id => registrarUso(codigo, id, inicio)));
  assert.equal(tentativas.filter(x => x.status === "fulfilled").length, 3);
  assert.ok(tentativas.filter(x => x.status === "rejected").every(x => x.reason.status === 429));
  await registrarUso(codigo, pedidos[tentativas.findIndex(x => x.status === "fulfilled")], inicio);
  await assert.rejects(consultarCupom(codigo, inicio), { status: 429 });
  assert.deepEqual(await consultarCupom(codigo, inicio + 60000), { restantes: 3 });
  await assert.rejects(consultarCupom(codigo, expira), { status: 400 });
});

test("cupom dá acesso somente ao ZIP autorizado e mantém o pagamento avulso", async () => {
  const { codigo } = await criarCupom({ nome: "", dias: 7, limite: 1 });
  const documento = {
    htmlCliente: "<p>Orçamento</p>", htmlControle: "<p>Controle</p>",
    nomeCliente: "Teste", temLogo: true, modeloId: "faixa",
  };
  // Os três fluxos preservam o preço do servidor.
  assert.equal((await requisitar(checkout, { body: { ...documento, precoExibido: 0 } })).codigo, 409);
  assert.equal((await requisitar(checkout, { body: { ...documento, precoExibido: 558 } })).codigo, 200);
  assert.equal(pagamentos.at(-1).line_items[0].price_data.unit_amount, 558);
  const totalPagamentos = pagamentos.length;
  const pedido = { ...documento, cupom: codigo, precoExibido: 0, pedidoId: randomUUID(), tokenDownload: segredo() };
  const gratuito = await requisitar(checkout, { body: pedido });
  assert.equal(gratuito.codigo, 200);
  assert.match(gratuito.conteudo.url, /^\/sucesso\.html\?id=/);
  assert.equal(pagamentos.length, totalPagamentos);
  assert.equal((await requisitar(checkout, { body: pedido })).codigo, 200);
  assert.equal((await requisitar(checkout, { body: { ...pedido, nomeCliente: "Alterado" } })).codigo, 409);
  assert.equal((await requisitar(checkout, { body: { ...pedido, pedidoId: randomUUID() } })).codigo, 429);
  assert.equal((await obterPedidoCupom(pedido.pedidoId, pedido.tokenDownload)).nomeCliente, "Teste");
  assert.equal(await obterPedidoCupom(pedido.pedidoId, segredo()), null);
  assert.equal(await obterPedidoCupom(randomUUID(), pedido.tokenDownload), null);
  assert.equal((await requisitar(download, { method: "GET", query: { id: pedido.pedidoId }, headers: { authorization: "Bearer " + segredo() } })).codigo, 403);
  assert.equal((await requisitar(download, { method: "GET", query: { id: pedido.pedidoId, session_id: "sessao-paga" } })).codigo, 400);
});

test("fluxo visual: cadastra, emite, aplica e baixa os dois PDFs", { skip: !process.env.ORCAMENTO_CHROME }, async () => {
  blobs.delete("cupons/admin.json");
  process.env.CUPONS_ADMIN_ORIGIN = "http://localhost:4175";
  const { default: puppeteer } = await import("puppeteer-core");
  const browser = await puppeteer.launch({
    executablePath: process.env.ORCAMENTO_CHROME, headless: "shell", pipe: true, args: ["--no-sandbox"],
  });
  try {
    const t = await browser.newPage();
    const errosPagina = [];
    t.on("pageerror", erro => errosPagina.push(erro.message));
    await t.setViewport({ width: 390, height: 840, isMobile: true, hasTouch: true });
    await t.setRequestInterception(true);
    const rotas = new Map([
      ["/api/painel-cupons", painel], ["/api/validar-cupom", validar], ["/api/criar-checkout", checkout],
    ]);
    const arquivos = new Map(Object.entries({
      "/": "index.html", "/modelos-orcamento.js": "modelos-orcamento.js", "/sucesso.html": "sucesso.html",
      "/dados-locais.js": "dados-locais.js", "/perfis-rascunho.js": "perfis-rascunho.js", "/andamento.css": "andamento.css",
    }));
    const zip = Promise.withResolvers();
    t.on("request", async request => {
      try {
        const url = new URL(request.url());
        const rota = rotas.get(url.pathname);
        const headers = { ...request.headers(), host: url.host };
        if (rota) {
          const body = request.hasPostData() ? JSON.parse(await request.fetchPostData()) : undefined;
          const resp = await requisitar(rota, { method: request.method(), body, headers });
          return await request.respond({
            status: resp.codigo, headers: resp.headers,
            body: typeof resp.conteudo === "string" ? resp.conteudo : JSON.stringify(resp.conteudo),
          });
        }
        if (url.pathname === "/api/gerar-pdfs") {
          const partes = [];
          const stream = new Writable({ write(chunk, _, next) { partes.push(chunk); next(); } });
          stream.setHeader = (chave, valor) => { stream.headers[chave.toLowerCase()] = valor; };
          stream.headers = {};
          stream.status = codigo => { stream.codigo = codigo; return stream; };
          stream.json = conteudo => stream.end(JSON.stringify(conteudo));
          const pronto = new Promise((resolve, reject) => { stream.on("finish", resolve); stream.on("error", reject); });
          await download({ method: "GET", query: Object.fromEntries(url.searchParams), headers }, stream);
          await pronto;
          const corpo = Buffer.concat(partes);
          await request.respond({ status: stream.codigo || 200, headers: stream.headers, body: corpo });
          zip.resolve({ corpo, stream });
          return;
        }
        const arquivo = arquivos.get(url.pathname);
        if (arquivo) return await request.respond({
          status: 200,
          contentType: arquivo.endsWith(".js") ? "application/javascript; charset=utf-8"
            : arquivo.endsWith(".css") ? "text/css; charset=utf-8" : "text/html; charset=utf-8",
          body: await readFile(new URL("../public/" + arquivo, import.meta.url)),
        });
        await request.abort();
      } catch (erro) {
        zip.reject(erro);
        if (!request.isInterceptResolutionHandled()) await request.abort();
      }
    });
    await t.goto("http://localhost:4175/api/painel-cupons");
    await t.waitForSelector("#acesso", { visible: true });
    await t.type('[name="nome"]', "Celular de teste");
    await t.type('[name="convite"]', process.env.CUPONS_ADMIN_SETUP);
    await t.type('[name="senha"]', senha);
    await t.click("#botao-acesso");
    await t.waitForSelector("#painel", { visible: true });
    await t.click("#novo-cupom button");
    await t.waitForSelector("#resultado", { visible: true });
    const codigo = await t.$eval("#codigo", e => e.textContent);
    await t.goto("http://localhost:4174/");
    await t.waitForSelector("#formCupom", { visible: true });
    await t.click('[data-modelo="faixa"]');
    assert.match(await t.$eval("#precoGeracao", e => e.textContent), /5,39/);
    await t.type("#codigoCupom", codigo);
    await t.click('#formCupom button[type="submit"]');
    await t.waitForFunction(() => document.querySelector("#precoGeracao").textContent.includes("0,00"));
    const pagamentosAntes = pagamentos.length;
    await t.click("#botaoGerarPDF");
    const { corpo, stream } = await zip.promise;
    assert.equal(stream.codigo, undefined);
    assert.equal(stream.headers["content-type"], "application/zip");
    assert.match(corpo.toString("latin1"), /orcamento-[^\0]+\.pdf/);
    assert.match(corpo.toString("latin1"), /controle-[^\0]+\.pdf/);
    assert.equal(pagamentos.length, pagamentosAntes);
    assert.deepEqual(await consultarCupom(codigo), { restantes: 2 });
    assert.deepEqual(errosPagina, []);
  } finally {
    await browser.close();
  }
});
