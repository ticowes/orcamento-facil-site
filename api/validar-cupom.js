import { ErroCupom } from "../lib/cupom-store.js";
import { consultarCupom, exigirCupons } from "../lib/cupons.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") return res.json({ disponivel: !!process.env.CUPONS_ADMIN_ORIGIN });
  if (req.method !== "POST") return res.status(405).end();
  try {
    exigirCupons(req);
    return res.json(await consultarCupom(req.body?.codigo));
  } catch (erro) {
    if (erro instanceof ErroCupom) return res.status(erro.status).json({ error: erro.message });
    return res.status(503).json({ error: "A validação do cupom está indisponível. Tente novamente." });
  }
}
