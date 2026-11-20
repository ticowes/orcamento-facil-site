import { randomBytes } from "node:crypto";
import { alterarRegistro, criarRegistro, ErroCupom, hash, lerRegistro } from "./cupom-store.js";

const relogio = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" });
const diaBrasil = agora => relogio.format(new Date(agora));
const msDia = 86400000;
const prefixo = "cupons/codigos/";
const codigoCanonico = valor => typeof valor === "string" ? valor.trim().toUpperCase() : "";
const caminho = codigo => prefixo + hash(codigoCanonico(codigo)) + ".json";
const limiteValido = (n, limite) => Number.isInteger(n) && n >= 1 && n <= limite;
const tentativas = new Map();

export function exigirCupons(req) {
  if (!process.env.CUPONS_ADMIN_ORIGIN) throw new ErroCupom(404, "Cupons indisponíveis.");
  const ip = req.headers["x-vercel-forwarded-for"] || req.socket?.remoteAddress || "local";
  const agora = Date.now();
  for (const [chave, janela] of tentativas) if (janela.expira <= agora) tentativas.delete(chave);
  const janela = tentativas.get(ip) || { expira: agora + 60000, total: 0 };
  if (janela.total >= 25 || (!tentativas.has(ip) && tentativas.size >= 2000)) {
    throw new ErroCupom(429, "Muitas tentativas de cupom. Aguarde um minuto.");
  }
  janela.total++;
  tentativas.set(ip, janela);
}

function verificar(cupom, agora) {
  if (!cupom || cupom.revogado || cupom.expira <= agora) {
    throw new ErroCupom(400, "Cupom inválido ou expirado.");
  }
  const restantes = cupom.limite - (cupom.usos[diaBrasil(agora)]?.length || 0);
  if (restantes <= 0) throw new ErroCupom(429, "Limite de hoje atingido. O saldo é renovado à meia-noite de Brasília.");
  return restantes;
}

function chaveCupom(codigo) {
  if (!/^OF-(?:[A-F0-9]{8}-){2}[A-F0-9]{8}$/.test(codigoCanonico(codigo))) {
    throw new ErroCupom(400, "Cupom inválido ou expirado.");
  }
  return caminho(codigo);
}

export async function criarCupom({ nome, dias, limite }, agora = Date.now()) {
  if (!limiteValido(dias, 90) || !limiteValido(limite, 100) || typeof nome !== "string" || nome.length > 120) {
    throw new ErroCupom(400, "Informe de 1 a 90 dias, de 1 a 100 gerações diárias e uma identificação de até 120 caracteres.");
  }
  const codigo = "OF-" + randomBytes(12).toString("hex").toUpperCase().match(/.{8}/g).join("-");
  const cupom = { nome: nome.trim(), expira: agora + dias * msDia, limite, usos: {}, revogado: false };
  await criarRegistro(caminho(codigo), cupom);
  return { codigo, expira: cupom.expira, limite };
}

export async function consultarCupom(codigo, agora = Date.now()) {
  const registro = await lerRegistro(chaveCupom(codigo));
  return { restantes: verificar(registro?.dados, agora) };
}

export function registrarUso(codigo, id, agora = Date.now(), atualizar = alterarRegistro) {
  return atualizar(chaveCupom(codigo), cupom => {
    if (Object.values(cupom.usos).some(usos => usos.includes(id))) return;
    verificar(cupom, agora);
    (cupom.usos[diaBrasil(agora)] ||= []).push(id);
  });
}

export const identificadorCupom = codigo => chaveCupom(codigo);

export async function usoAutorizado(registroCupom, id) {
  if (typeof registroCupom !== "string" || !/^cupons\/codigos\/[a-f0-9]{64}\.json$/.test(registroCupom)) return false;
  const registro = await lerRegistro(registroCupom);
  return !!registro && Object.values(registro.dados.usos).some(usos => usos.includes(id));
}

export async function listarCupons(listar) {
  const { blobs } = await listar({ prefix: prefixo, limit: 100 });
  const cupons = await Promise.all(blobs.map(async ({ pathname }) => {
    const registro = await lerRegistro(pathname);
    if (!registro) return null;
    const { nome, expira, limite, usos, revogado } = registro.dados;
    return {
      id: pathname.slice(prefixo.length, -5), nome, expira, limite, revogado,
      usadosHoje: usos[diaBrasil(Date.now())]?.length || 0,
    };
  }));
  return cupons.filter(Boolean).sort((a, b) => b.expira - a.expira);
}

export async function revogarCupom(id) {
  if (typeof id !== "string" || !/^[a-f0-9]{64}$/.test(id)) throw new ErroCupom(400, "Cupom inválido.");
  await alterarRegistro(prefixo + id + ".json", cupom => { cupom.revogado = true; });
}
