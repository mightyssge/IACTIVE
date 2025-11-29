const textoEl = document.getElementById("texto");
const tasaEl = document.getElementById("tasa");
const monedaEl = document.getElementById("moneda");
const statusEl = document.getElementById("status");
const alertaEl = document.getElementById("alerta");
const draftBox = document.getElementById("draft_llm");
const invoiceBox = document.getElementById("invoice_final");
const previewFrame = document.getElementById("preview");
const downloadPdfBtn = document.getElementById("download-pdf");
const downloadJsonBtn = document.getElementById("download-json");
const inconsBadge = document.getElementById("incons-badge");
const historyList = document.getElementById("history");

let lastInvoiceId = null;

document.getElementById("btn-generar").addEventListener("click", generate);
document.getElementById("ejemplo1").addEventListener("click", () => {
  textoEl.value = "Genera una factura a ACME SAC por 2 laptops a 2500 cada una y 1 mouse a 80 soles";
});
document.getElementById("ejemplo2").addEventListener("click", () => {
  textoEl.value = "Boleta para Juan Pérez por 3 sillas ergonómicas a 320 c/u en USD y 1 escritorio a 450";
});

const API_BASE = window.API_BASE || "http://localhost:3000";

async function generate() {
  alertaEl.style.display = "none";
  if (!textoEl.value || textoEl.value.trim().length < 5) {
    alertaEl.textContent = "Escribe al menos 5 caracteres.";
    alertaEl.style.display = "block";
    return;
  }
  statusEl.textContent = "Procesando...";
  statusEl.classList.add("warn");
  try {
    const res = await fetch(`${API_BASE}/api/invoices/from-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        texto: textoEl.value,
        config: {
          tasa_igv: parseFloat(tasaEl.value) || 0.18,
          moneda_default: monedaEl.value || "PEN",
        },
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al generar");
    }
    const data = await res.json();
    lastInvoiceId = data.invoice_final.encabezado.id_interno;
    draftBox.textContent = JSON.stringify(data.draft_llm, null, 2);
    invoiceBox.textContent = JSON.stringify(data.invoice_final, null, 2);
    previewFrame.srcdoc = data.html_preview;

    const hasIncons = (data.draft_llm.inconsistencias_detectadas || []).length > 0;
    inconsBadge.style.display = hasIncons ? "inline-flex" : "none";
    downloadPdfBtn.style.display = "inline-flex";
    downloadJsonBtn.style.display = "inline-flex";

    downloadPdfBtn.onclick = () => window.open(`${API_BASE}${data.pdf_url}`, "_blank");
    downloadJsonBtn.onclick = () => window.open(`${API_BASE}/api/invoices/${lastInvoiceId}/json`, "_blank");
    statusEl.textContent = "Listo";
    statusEl.classList.remove("warn");
    await loadHistory();
  } catch (err) {
    alertaEl.textContent = err.message;
    alertaEl.style.display = "block";
    statusEl.textContent = "Error";
    statusEl.classList.add("warn");
  }
}

async function loadHistory() {
  const res = await fetch(`${API_BASE}/api/invoices/history`);
  const data = await res.json();
  historyList.innerHTML = "";
  (data.invoices || []).forEach((inv) => {
    const li = document.createElement("li");
    li.innerHTML = `<span><span class="status-dot"></span>${inv.encabezado.id_interno}</span>
    <span>${inv.cliente.nombre_razon_social} • ${inv.totales.total}</span>`;
    li.onclick = () => {
      invoiceBox.textContent = JSON.stringify(inv, null, 2);
      previewFrame.srcdoc = "";
      downloadPdfBtn.style.display = "none";
    };
    historyList.appendChild(li);
  });
}

loadHistory();
