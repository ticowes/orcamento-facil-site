import Stripe from "stripe";
import { put } from "@vercel/blob";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 🔥 CONFIGURAÇÃO DE PREÇOS (FÁCIL DE ESCALAR)
const PRECOS = {
  base: 490,     // R$ 4,90
  logo: 19       // R$ 0,19
};

export default async function handler(req,res){

if(req.method !== "POST")
return res.status(405).end();

try{

const { htmlCliente, htmlControle, nomeCliente, temLogo } = req.body;

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

// 🔥 CALCULA VALOR DINÂMICO
let valorFinal = PRECOS.base;

if(temLogo){
  valorFinal += PRECOS.logo;
}

// 🔥 DESCRIÇÃO DINÂMICA
const nomeProduto = temLogo
  ? "Gerar PDFs + Logo"
  : "Gerar PDFs";

// 🔥 STRIPE
const session = await stripe.checkout.sessions.create({

mode:"payment",

payment_method_types:["card"],

metadata: {
  id: id,
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
