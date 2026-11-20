import { criarRegistro, ErroCupom, formatoSegredo, hash, iguais, lerRegistro } from "./cupom-store.js";
import { consultarCupom, exigirCupons, identificadorCupom, registrarUso, usoAutorizado } from "./cupons.js";

const formatoId = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const caminho = id => `orcamentos-cupom/${id}.json`;

export async function criarPedidoCupom(req, documento) {
  exigirCupons(req);
  const { cupom, pedidoId, tokenDownload } = req.body;
  if (typeof pedidoId !== "string" || !formatoId.test(pedidoId) || !formatoSegredo(tokenDownload)) {
    throw new ErroCupom(400, "Pedido de cupom inválido.");
  }
  const autorizacao = {
    cupom: identificadorCupom(cupom),
    token: hash(tokenDownload),
    conteudo: hash(JSON.stringify(documento)),
    expira: Date.now() + 86400000,
  };
  const path = caminho(pedidoId);
  let existente = await lerRegistro(path);
  if (!existente) {
    await consultarCupom(cupom);
    try {
      await criarRegistro(path, { ...documento, autorizacao });
    } catch (erro) {
      existente = await lerRegistro(path);
      if (!existente) throw erro;
    }
  }
  if (existente) {
    const anterior = existente.dados.autorizacao;
    if (!anterior || anterior.expira <= Date.now() || !iguais(anterior.token, autorizacao.token) ||
        !iguais(anterior.conteudo, autorizacao.conteudo) || anterior.cupom !== autorizacao.cupom) {
      throw new ErroCupom(409, "Este pedido mudou. Aplique o cupom novamente.");
    }
  }
  await registrarUso(cupom, pedidoId);
  return `/sucesso.html?id=${pedidoId}#cupom=${tokenDownload}`;
}

export async function obterPedidoCupom(id, token) {
  if (typeof id !== "string" || !formatoId.test(id) || !formatoSegredo(token)) return null;
  const { dados } = (await lerRegistro(caminho(id))) || {};
  const autorizacao = dados?.autorizacao;
  if (!autorizacao || autorizacao.expira <= Date.now() || !iguais(autorizacao.token, hash(token))) return null;
  if (!(await usoAutorizado(autorizacao.cupom, id))) return null;
  return dados;
}
