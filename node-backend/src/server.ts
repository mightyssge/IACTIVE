import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { callLlmParseInvoice } from "./llmClient";
import { normalizeDraft } from "./draftNormalizer";
import { buildInvoice } from "./invoiceCalculator";
import { renderInvoiceHtml } from "./rendererHtml";
import { renderPdf } from "./rendererPdf";
import { saveInvoice, getInvoice, listInvoices } from "./inMemoryStore";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));

const fallbackFrontend = path.join(__dirname, "..", "..", "frontend");
const altFrontend = path.join(
  __dirname,
  "..",
  "..",
  "Interfaz Web Agente Facturación (6)",
  "build"
);
const FRONTEND_DIR =
  process.env.FRONTEND_DIR || (fs.existsSync(altFrontend) ? altFrontend : fallbackFrontend);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/invoices/history", (_req, res) => {
  res.json({ invoices: listInvoices(20) });
});

app.post("/api/invoices/from-text", async (req, res) => {
  try {
    const { texto, config } = req.body || {};
    if (!texto || typeof texto !== "string" || texto.trim().length < 5) {
      return res
        .status(400)
        .json({ error: "texto es requerido y debe tener al menos 5 caracteres." });
    }

    const draft_llm = await callLlmParseInvoice({ texto, config });

    const { normalized: draft_normalized, warnings: normalizeWarnings } =
      normalizeDraft(draft_llm, config);

    const invoice_final = buildInvoice(
      draft_normalized,
      texto,
      [...normalizeWarnings, ...(draft_llm.inconsistencias_detectadas || [])],
      { tasaIgv: config?.tasa_igv }
    );

    const html_preview = renderInvoiceHtml(invoice_final);
    const pdfPath = await renderPdf(invoice_final);
    saveInvoice({ invoice: invoice_final, html: html_preview, pdfPath });

    res.json({
      draft_llm,
      draft_normalized,
      invoice_final,
      html_preview,
      pdf_url: `/api/invoices/${invoice_final.encabezado.id_interno}/pdf`,
      warnings: invoice_final.metadata.warnings,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      error: "No se pudo procesar la factura.",
      details: err?.response?.data || err?.message,
    });
  }
});

app.get("/api/invoices/:id/pdf", async (req, res) => {
  const { id } = req.params;
  const record = getInvoice(id);
  if (!record || !record.pdfPath) {
    return res.status(404).json({ error: "Factura no encontrada" });
  }
  res.sendFile(record.pdfPath);
});

app.get("/api/invoices/:id/json", (req, res) => {
  const { id } = req.params;
  const record = getInvoice(id);
  if (!record) {
    return res.status(404).json({ error: "Factura no encontrada" });
  }
  res.setHeader("Content-Disposition", `attachment; filename=${id}.json`);
  res.json(record.invoice);
});

// Servir frontend estático del agente de facturación
app.use(express.static(FRONTEND_DIR));
app.get("/", (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Node backend escuchando en puerto ${PORT}`);
});
