import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface InvoiceFormProps {
  onGenerate: (payload: { texto: string; tasaIgv: number; moneda: string }) => void;
  isGenerating: boolean;
}

const examples = [
  "Genera una factura a ACME SAC por 2 laptops a 2500 cada una y 1 mouse a 80 soles",
  "Boleta para Juan Pérez por 3 sillas ergonómicas a 320 c/u en USD y 1 escritorio a 450",
  "Factura a Globant Perú por 12 horas de consultoría a 180 USD/hora y 1 licenciamiento anual a 1200 USD",
];

export function InvoiceForm({ onGenerate, isGenerating }: InvoiceFormProps) {
  const [texto, setTexto] = useState(examples[0]);
  const [tasaIgv, setTasaIgv] = useState(0.18);
  const [moneda, setMoneda] = useState("PEN");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    onGenerate({ texto, tasaIgv: tasaIgv || 0.18, moneda: moneda || "PEN" });
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
      <div className="mb-6">
        <h2 className="text-slate-900 mb-2">Generar factura</h2>
        <p className="text-slate-600 text-sm">
          Describe la factura en lenguaje natural. El backend LLM parsea y el backend Node calcula totales.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="texto" className="block text-slate-700 mb-2">
            Descripción de la factura
          </label>
          <textarea
            id="texto"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
            placeholder="Ej: Factura a ACME por 2 laptops a 2500 y 1 mouse a 80..."
            disabled={isGenerating}
          />
          <p className="text-slate-500 text-xs mt-1">{texto.length}/800 caracteres</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 mb-2">Tasa IGV</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="0.25"
              value={tasaIgv}
              onChange={(e) => setTasaIgv(parseFloat(e.target.value))}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isGenerating}
            />
          </div>
          <div>
            <label className="block text-slate-700 mb-2">Moneda</label>
            <input
              type="text"
              value={moneda}
              onChange={(e) => setMoneda(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isGenerating}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-slate-600 text-sm">Ejemplos rápidos:</p>
          <div className="grid gap-2">
            {examples.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTexto(ex)}
                className="w-full text-left px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm rounded-lg transition-colors border border-slate-200"
                disabled={isGenerating}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!texto.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generar factura
            </>
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-900">
        Tip: El LLM solo interpreta el texto. Los cálculos se hacen en el backend Node con IGV y moneda que definas.
      </div>
    </div>
  );
}
