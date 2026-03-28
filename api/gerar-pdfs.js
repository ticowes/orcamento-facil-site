import Stripe from "stripe";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import archiver from "archiver";
import { list } from "@vercel/blob";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 🔥 GERA CÓDIGO ÚNICO
function gerarCodigoUnico() {
  const tempo = Date.now().toString(36);
  const aleatorio = Math.random().toString(36).substring(2, 6);
  return (tempo + aleatorio).toUpperCase();
}

// 🔥 NORMALIZA NOME
function normalizarNome(nome) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export default async function handler(req, res) {
  try {

    const { session_id, id } = req.query;

    if (!session_id || !id) {
      return res.status(400).json({ error: "session_id ou id ausente" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Pagamento não confirmado" });
    }

    const arquivos = await list({
      prefix: `orcamentos/${id}`,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    if (!arquivos.blobs || arquivos.blobs.length === 0) {
      return res.status(404).json({ error: "Arquivo não encontrado no Blob" });
    }

    const url = arquivos.blobs[0].url;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
      }
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Falha ao ler JSON do Blob" });
    }

    const dados = await response.json();

    let nomeCliente = normalizarNome(dados.nomeCliente || "cliente");

    const dataHoje = new Date().toISOString().slice(0, 10);
    const codigoUnico = gerarCodigoUnico();

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true
    });

    const page = await browser.newPage();

    // ===== PDF CLIENTE =====
await page.setContent(dados.htmlCliente, { waitUntil: "load" });

const pdfCliente = Buffer.from(
  await page.pdf({
    format: "A4",

    margin: {
      top: "30mm",
      bottom: "25mm",
      left: "20mm",
      right: "20mm"
    },

    displayHeaderFooter: true,

    headerTemplate: `
      <div style="width:100%; text-align:center; font-size:10px; color:#999;">
      </div>
    `,

    footerTemplate: `
      <div style="width:100%; font-size:10px; color:#999; padding:0 20px; display:flex; justify-content:space-between;">
        
        <div>Orçamento Fácil</div>
        
        <div>
          Página <span class="pageNumber"></span> de <span class="totalPages"></span>
        </div>
        
      </div>
    `
  })
);


// ===== PDF CONTROLE =====
await page.setContent(dados.htmlControle, { waitUntil: "load" });

const pdfControle = Buffer.from(
  await page.pdf({
    format: "A4",

    margin: {
      top: "25mm",
      bottom: "20mm",
      left: "18mm",
      right: "18mm"
    },

    displayHeaderFooter: true,

    headerTemplate: `
      <div style="width:100%; text-align:center; font-size:9px; color:#aaa;">
        Documento interno
      </div>
    `,

    footerTemplate: `
      <div style="width:100%; font-size:9px; color:#aaa; padding:0 15px; display:flex; justify-content:space-between;">
        
        <div>Controle interno</div>
        
        <div>
          Página <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
        
      </div>
    `
  })
);

    await browser.close();

    const nomeZip = `orcamento-${nomeCliente}-${dataHoje}-${codigoUnico}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nomeZip}"`
    );

    const archive = archiver("zip");
    archive.pipe(res);

    archive.append(pdfCliente, {
  name: `orcamento-${nomeCliente}-${dataHoje}-${codigoUnico}.pdf`
});

archive.append(pdfControle, {
  name: `controle-${nomeCliente}-${dataHoje}-${codigoUnico}.pdf`
});

    archive.finalize();

  } catch (err) {
    console.error("ERRO:", err);

    res.status(500).json({
      error: "Erro ao gerar PDFs",
      detalhe: err.message
    });
  }
}
