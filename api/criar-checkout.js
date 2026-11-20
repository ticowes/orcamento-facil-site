import Stripe from "stripe";
import { put } from "@vercel/blob";
import "../public/modelos-orcamento.js";
import { criarPedidoCupom } from "../lib/pedido-cupom.js";
import { ErroCupom } from "../lib/cupom-store.js";

const { MODELOS, precoOrcamento } = globalThis.catalogoOrcamentoFacil;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req,res){

if(req.method !== "POST")
return res.status(405).end();

try{

const { htmlCliente, htmlControle, nomeCliente, temLogo, modeloId = "original", precoExibido } = req.body;
const modelo = MODELOS.find(({ id }) => id === modeloId);
if (!modelo) {
  return res.status(400).json({ error: "Modelo de orçamento inválido." });
}
const valorFinal = precoOrcamento(modelo, !!temLogo);
const documento = { htmlCliente, htmlControle, nomeCliente, temLogo: !!temLogo, modeloId: modelo.id };
const comCupom = typeof req.body.cupom === "string" && req.body.cupom.length > 0;
if (precoExibido !== undefined && precoExibido !== (comCupom ? 0 : valorFinal)) {
  return res.status(409).json({ error: "O preço mudou. Recarregue a página antes de gerar os PDFs." });
}
if (comCupom) {
  if (typeof htmlCliente !== "string" || !htmlCliente || typeof htmlControle !== "string" || !htmlControle ||
      typeof nomeCliente !== "string" || nomeCliente.length > 1000) {
    return res.status(400).json({ error: "Orçamento inválido." });
  }
  return res.json({ url: await criarPedidoCupom(req, documento) });
}

const id = crypto.randomUUID();

// 🔥 SALVA DADOS (inclui temLogo)
await put(
`orcamentos/${id}.json`,
JSON.stringify(documento),
{
access:"private",
contentType:"application/json"
}
);

const nomeProduto = [
  "Gerar PDFs",
  temLogo && "Logo",
  modelo.acrescimo > 0 && modelo.nome,
].filter(Boolean).join(" + ");

// 🔥 STRIPE
const session = await stripe.checkout.sessions.create({

mode:"payment",

payment_method_types:["card"],

metadata: {
  id: id,
  modelo: modelo.id,
  temLogo: temLogo ? "true" : "false"
},

line_items:[{
price_data:{
currency:"brl",
product_data:{
name: nomeProduto
},
unit_amount: valorFinal
},
quantity:1
}],

success_url:
"https://orcamentofacil.app.br/sucesso.html?session_id={CHECKOUT_SESSION_ID}&id=" + id,

cancel_url:
"https://orcamentofacil.app.br/"
});

res.json({url:session.url});

}catch(err){
if (err instanceof ErroCupom) return res.status(err.status).json({ error: err.message });

res.status(500).json({
error:err.message
});

}
}
