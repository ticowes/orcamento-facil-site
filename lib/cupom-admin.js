import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { alterarRegistro, criarRegistro, ErroCupom, formatoSegredo, hash, iguais, lerRegistro, segredo } from "./cupom-store.js";

const scryptAsync = promisify(scrypt);
const path = "cupons/admin.json";
const duracaoSessao = 30 * 60;
const duracaoAparelho = 365 * 86400;
const cookieAparelho = "__Host-of-aparelho";
const cookieSessao = "__Host-of-admin";
const negado = () => new ErroCupom(401, "Acesso administrativo não autorizado.");

const cookies = req => Object.fromEntries((req.headers.cookie || "").split(/;\s*/).map(x => {
  const pos = x.indexOf("=");
  return [x.slice(0, pos), x.slice(pos + 1)];
}));

function autenticarAparelho(req, dados) {
  const token = cookies(req)[cookieAparelho];
  if (!formatoSegredo(token)) return;
  const id = hash(token);
  return dados?.aparelhos.find(aparelho => aparelho.id === id);
}

function montarCookie(nome, token, duracao) {
  return `${nome}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${duracao}`;
}

const derivarSenha = async (senha, sal) => (await scryptAsync(senha, sal, 64)).toString("hex");

export function origemPainel(req) {
  const origem = process.env.CUPONS_ADMIN_ORIGIN;
  if (!origem) return false;
  const url = new URL(origem);
  if (req.headers.host !== url.host) return false;
  return req.method === "GET" || req.headers.origin === url.origin;
}

export async function acessoPainel(req) {
  const registro = await lerRegistro(path);
  const aparelho = autenticarAparelho(req, registro?.dados);
  const token = cookies(req)[cookieSessao];
  return {
    configurado: !!registro,
    cadastrado: !!aparelho,
    autenticado: !!aparelho && formatoSegredo(token) && aparelho.sessaoExpira > Date.now() &&
      iguais(aparelho.sessao, hash(token)),
  };
}

export async function exigirAdmin(req) {
  if (!(await acessoPainel(req)).autenticado) throw negado();
}

function novoAparelho(nome, token) {
  if (typeof nome !== "string" || !nome.trim() || nome.length > 60) {
    throw new ErroCupom(400, "Digite um nome de até 60 caracteres para o aparelho.");
  }
  return { id: hash(token), nome: nome.trim() };
}

export async function cadastrarAparelho({ convite, senha, nome }) {
  if (!formatoSegredo(convite) || typeof senha !== "string" || senha.length < 16 || senha.length > 200) throw negado();
  const token = segredo();
  const aparelho = novoAparelho(nome, token);
  const registro = await lerRegistro(path);
  if (!registro) {
    if (!formatoSegredo(process.env.CUPONS_ADMIN_SETUP) || !iguais(convite, process.env.CUPONS_ADMIN_SETUP)) throw negado();
    const sal = randomBytes(32).toString("hex");
    await criarRegistro(path, { sal, senha: await derivarSenha(senha, sal), aparelhos: [aparelho], convite: null });
  } else {
    const dados = await alterarRegistro(path, atual => {
      if (atual.convite?.expira <= Date.now() || !iguais(atual.convite?.hash, hash(convite))) throw negado();
      if (atual.convite.tentativas >= 8) throw negado();
      atual.convite.tentativas++;
      return { sal: atual.sal, senha: atual.senha };
    });
    const verificada = await derivarSenha(senha, dados.sal);
    if (!iguais(dados.senha, verificada)) throw negado();
    await alterarRegistro(path, atual => {
      if (atual.convite?.expira <= Date.now() || !iguais(atual.convite?.hash, hash(convite))) throw negado();
      if (atual.aparelhos.length >= 3) throw new ErroCupom(409, "Revogue um dos três aparelhos antes de cadastrar outro.");
      atual.aparelhos.push(aparelho);
      atual.convite = null;
    });
  }
  return montarCookie(cookieAparelho, token, duracaoAparelho);
}

export async function entrarPainel(req, senha) {
  if (typeof senha !== "string" || senha.length > 200 || !formatoSegredo(cookies(req)[cookieAparelho])) throw negado();
  const dados = await alterarRegistro(path, dados => {
    const aparelho = autenticarAparelho(req, dados);
    if (!aparelho) throw negado();
    if (!(aparelho.tentativasExpiram > Date.now())) {
      aparelho.tentativas = 0;
      aparelho.tentativasExpiram = Date.now() + 15 * 60000;
    }
    if (aparelho.tentativas >= 8) throw new ErroCupom(429, "Aguarde 15 minutos antes de tentar de novo.");
    aparelho.tentativas++;
    return { sal: dados.sal, senha: dados.senha };
  });
  if (!iguais(dados.senha, await derivarSenha(senha, dados.sal))) throw negado();
  const token = segredo();
  await alterarRegistro(path, atual => {
    const aparelho = autenticarAparelho(req, atual);
    if (!aparelho || !iguais(dados.senha, atual.senha)) throw negado();
    aparelho.sessao = hash(token);
    aparelho.sessaoExpira = Date.now() + duracaoSessao * 1000;
    aparelho.tentativas = 0;
  });
  return montarCookie(cookieSessao, token, duracaoSessao);
}

export async function convidarAparelho() {
  const convite = segredo();
  await alterarRegistro(path, dados => {
    if (dados.aparelhos.length >= 3) throw new ErroCupom(409, "Revogue um dos três aparelhos antes de cadastrar outro.");
    dados.convite = { hash: hash(convite), expira: Date.now() + 10 * 60000, tentativas: 0 };
  });
  return convite;
}

export async function listarAparelhos(req) {
  const { dados } = await lerRegistro(path);
  const atual = autenticarAparelho(req, dados);
  return dados.aparelhos.map(({ id, nome }) => ({ id, nome, atual: id === atual?.id }));
}

export async function revogarAparelho(req, id) {
  await alterarRegistro(path, dados => {
    if (id === autenticarAparelho(req, dados)?.id) throw new ErroCupom(400, "Use outro aparelho autorizado para revogar este.");
    dados.aparelhos = dados.aparelhos.filter(aparelho => aparelho.id !== id);
  });
}

export async function sairPainel(req) {
  await alterarRegistro(path, dados => {
    const aparelho = autenticarAparelho(req, dados);
    if (aparelho) {
      delete aparelho.sessao;
      delete aparelho.sessaoExpira;
    }
  });
  return montarCookie(cookieSessao, "", 0);
}
