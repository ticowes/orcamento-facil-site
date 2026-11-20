import { randomBytes } from "node:crypto";
import { list } from "@vercel/blob";
import { acessoPainel, cadastrarAparelho, convidarAparelho, entrarPainel, exigirAdmin, listarAparelhos, origemPainel, revogarAparelho, sairPainel } from "../lib/cupom-admin.js";
import { criarCupom, listarCupons, revogarCupom } from "../lib/cupons.js";
import { ErroCupom } from "../lib/cupom-store.js";
import { painel } from "../lib/painel-cupons-html.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  if (!origemPainel(req)) return res.status(404).end();
  if (req.method === "GET") {
    const nonce = randomBytes(18).toString("base64");
    res.setHeader("Content-Security-Policy", `default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'; connect-src 'self'; frame-ancestors 'none'; form-action 'none'; base-uri 'none'`);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.end(painel.replaceAll("NONCE_PAINEL", nonce));
  }
  if (req.method !== "POST" || !req.headers["content-type"]?.startsWith("application/json")) return res.status(405).end();

  try {
    const { acao, convite, senha, nome, dias, limite, id } = req.body || {};
    if (acao === "estado") return res.json(await acessoPainel(req));
    if (acao === "cadastrar") {
      res.setHeader("Set-Cookie", await cadastrarAparelho({ convite, senha, nome }));
      return res.json({ cadastrado: true });
    }
    if (acao === "entrar") {
      res.setHeader("Set-Cookie", await entrarPainel(req, senha));
      return res.json({ autenticado: true });
    }
    await exigirAdmin(req);
    if (acao === "listar") {
      const [cupons, aparelhos] = await Promise.all([listarCupons(list), listarAparelhos(req)]);
      return res.json({ cupons, aparelhos });
    }
    if (acao === "criar") return res.json(await criarCupom({ nome, dias, limite }));
    if (acao === "convidar") return res.json({ convite: await convidarAparelho() });
    if (acao === "revogar-cupom") await revogarCupom(id);
    else if (acao === "revogar-aparelho") await revogarAparelho(req, id);
    else if (acao === "sair") res.setHeader("Set-Cookie", await sairPainel(req));
    else return res.status(400).json({ error: "Ação desconhecida." });
    return res.json({ ok: true });
  } catch (erro) {
    if (erro instanceof ErroCupom) return res.status(erro.status).json({ error: erro.message });
    console.error("Falha no painel de cupons", erro.name);
    return res.status(500).json({ error: "O painel está indisponível. Tente novamente." });
  }
}
