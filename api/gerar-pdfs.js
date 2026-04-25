import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import archiver from "archiver";

function gerarCodigoUnico() {
  const tempo = Date.now().toString(36);
  const aleatorio = Math.random().toString(36).substring(2, 6);
  return (tempo + aleatorio).toUpperCase();
}

function normalizarNome(nome) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {

    const { htmlCliente, htmlControle, nomeCliente } = req.body;

    if (!htmlCliente || !htmlControle) {
      return res.status(400).json({ error: "HTML não enviado" });
    }

    const nome = normalizarNome(nomeCliente || "cliente");
    const dataHoje = new Date().toISOString().slice(0, 10);
    const codigo = gerarCodigoUnico();

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true
    });

    const page = await browser.newPage();

    // PDF cliente
    await page.setContent(htmlCliente, { waitUntil: "load" });
    const pdfCliente = await page.pdf({ format: "A4" });

    // PDF controle
    await page.setContent(htmlControle, { waitUntil: "load" });
    const pdfControle = await page.pdf({ format: "A4" });

    await browser.close();

    const nomeZip = `orcamento-${nome}-${dataHoje}-${codigo}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nomeZip}"`
    );

    const archive = archiver("zip");
    archive.pipe(res);

    archive.append(pdfCliente, {
      name: `orcamento-${nome}.pdf`
    });

    archive.append(pdfControle, {
      name: `controle-${nome}.pdf`
    });

    archive.finalize();

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao gerar PDFs",
      detalhe: err.message
    });
  }
}
