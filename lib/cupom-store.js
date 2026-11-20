import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const hash = value => createHash("sha256").update(value).digest("hex");
export const segredo = () => randomBytes(32).toString("base64url");
export const formatoSegredo = value => typeof value === "string" && /^[\w-]{43}$/.test(value);
export const iguais = (a, b) => typeof a === "string" && typeof b === "string" &&
  a.length === b.length && timingSafeEqual(Buffer.from(hash(a), "hex"), Buffer.from(hash(b), "hex"));

export class ErroCupom extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const opcoes = { access: "private", contentType: "application/json", addRandomSuffix: false };

export async function lerRegistro(path) {
  const resultado = await get(path, { access: "private", useCache: false });
  if (!resultado) return null;
  if (resultado.statusCode !== 200) throw new Error("Leitura do Blob incompleta");
  return { dados: await new Response(resultado.stream).json(), etag: resultado.blob.etag };
}

export function criarRegistro(path, dados) {
  return put(path, JSON.stringify(dados), opcoes);
}

export async function alterarRegistro(path, alterar, armazenamento = { lerRegistro, put }) {
  for (let tentativa = 0; tentativa < 8; tentativa++) {
    const registro = await armazenamento.lerRegistro(path);
    if (!registro) throw new ErroCupom(404, "Registro indisponível.");
    const resultado = alterar(registro.dados);
    try {
      await armazenamento.put(path, JSON.stringify(registro.dados), {
        ...opcoes, allowOverwrite: true, ifMatch: registro.etag,
      });
      return resultado;
    } catch (erro) {
      if (!(erro instanceof BlobPreconditionFailedError)) throw erro;
    }
  }
  throw new ErroCupom(409, "Houve outro pedido ao mesmo tempo. Tente novamente.");
}
