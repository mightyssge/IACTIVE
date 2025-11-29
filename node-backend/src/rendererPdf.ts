import fs from "fs";
import path from "path";
import { renderInvoiceHtml } from "./rendererHtml";
import { InvoiceFinal } from "./types";
import puppeteer from "puppeteer";

export async function renderPdf(invoice: InvoiceFinal): Promise<string> {
  const html = renderInvoiceHtml(invoice);
  const tmpDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }
  const filePath = path.join(tmpDir, `${invoice.encabezado.id_interno}.pdf`);

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.pdf({ path: filePath, format: "A4" });
  await browser.close();
  return filePath;
}
