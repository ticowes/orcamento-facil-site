import Stripe from "stripe";
import { list, put } from "@vercel/blob";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    const buf = await new Promise((resolve) => {
      let data = "";
      req.on("data", chunk => data += chunk);
      req.on("end", () => resolve(Buffer.from(data)));
    });

    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

  } catch (err) {
    console.log("Erro webhook:", err.message);
    return res.status(400).send(`Erro webhook`);
  }

  if (event.type === "checkout.session.completed") {

    const session = event.data.object;

    const id = session.metadata?.id;

    if (!id) return res.json({ received: true });

    const arquivos = await list({
      prefix: `orcamentos/${id}`,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    if (!arquivos.blobs.length) return res.json({ received: true });

    const file = arquivos.blobs[0];

    const response = await fetch(file.url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
      }
    });

    const dados = await response.json();

    dados.pago = true;

    await put(
      `orcamentos/${id}.json`,
      JSON.stringify(dados),
      {
        access: "private",
        contentType: "application/json"
      }
    );

    console.log("✅ Webhook confirmou pagamento:", id);
  }

  res.json({ received: true });
}
