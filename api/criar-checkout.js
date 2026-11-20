import Stripe from "stripe";
import { put } from "@vercel/blob";
import "../public/modelos-orcamento.js";

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
if (precoExibido !== undefined && precoExibido !== valorFinal) {
  return res.status(409).json({ error: "O preço mudou. Recarregue a página antes de gerar os PDFs." });
}

const id = crypto.randomUUID();

// 🔥 SALVA DADOS (inclui temLogo)
await put(
`orcamentos/${id}.json`,
JSON.stringify({
htmlCliente,
htmlControle,
nomeCliente,
temLogo: !!temLogo
}),
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

res.status(500).json({
error:err.message
});

}
}
