import React, { useState } from "react";
import { FileText, AlertCircle } from "lucide-react";
import { InvoiceForm } from "./components/InvoiceForm";
import { InvoicePreview } from "./components/InvoicePreview";
import { InvoiceJSON } from "./components/InvoiceJSON";

type LlmDraft = {
  raw_text: string;
  cliente: { nombre_razon_social: string | null; tipo_documento: string | null; numero_documento: string | null };
  tipo_comprobante: string | null;
  moneda: string | null;
  items: { descripcion: string; cantidad: number | null; precio_unitario: number | null }[];
  observaciones: string | null;
  inconsistencias_detectadas: string[];
};

type InvoiceFinal = {
  encabezado: {
    id_interno: string;
    tipo_comprobante: string;
    serie: string;
    numero: string;
    fecha_emision: string;
    moneda: string;
  };
  emisor: { ruc: string; razon_social: string; direccion: string };
  cliente: {
    tipo_documento: string;
    numero_documento: string;
    nombre_razon_social: string;
    direccion: string | null;
  };
  items: {
    item: number;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    importe: number;
  }[];
  totales: { neto: number; tasa_igv: number; igv: number; total: number };
  metadata: { source_text: string; warnings: string[] };
};

type ApiResponse = {
  draft_llm: LlmDraft;
  draft_normalized: any;
  invoice_final: InvoiceFinal;
  html_preview: string;
  pdf_url: string;
  warnings: string[];
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || "";

  const handleGenerate = async (payload: { texto: string; tasaIgv: number; moneda: string }) => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE}/api/invoices/from-text`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: payload.texto,
          config: { tasa_igv: payload.tasaIgv, moneda_default: payload.moneda },
        }),
      });
      const raw = await res.text();
      if (!res.ok) {
        let errMsg = "No se pudo generar la factura";
        try {
          const errJson = JSON.parse(raw);
          errMsg = errJson.error || errMsg;
        } catch (_) {
          if (raw) errMsg = raw;
        }
        throw new Error(errMsg);
      }
      try {
        const json = JSON.parse(raw) as ApiResponse;
        setData(json);
      } catch (e) {
        throw new Error("Respuesta no es JSON válida: " + (raw || "vacía"));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-slate-900">Agente de Facturación SUNAT</h1>
              <p className="text-slate-500 text-sm">Texto libre → LLM → cálculo determinista → PDF</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <InvoiceForm onGenerate={handleGenerate} isGenerating={loading} />
            {error && (
              <div className="mt-4 flex items-start gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl p-4">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {data ? (
              <>
                <InvoicePreview invoice={data.invoice_final} pdfUrl={data.pdf_url} warnings={data.warnings} />
                <InvoiceJSON title="Borrador LLM" data={data.draft_llm} />
                <InvoiceJSON title="Factura final" data={data.invoice_final} />
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                    <h4 className="text-slate-900">Vista previa HTML</h4>
                    <p className="text-slate-500 text-sm">Render que se usa para el PDF</p>
                  </div>
                  <iframe title="preview" srcDoc={data.html_preview} className="w-full h-[480px] border-0" />
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
                <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-slate-900 mb-2">Sin factura generada</h3>
                <p className="text-slate-500 text-sm">
                  Completa el formulario y genera una factura para ver la salida LLM, totales y PDF.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
