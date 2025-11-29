import React, { useState } from "react";
import { Code2, Copy, Check } from "lucide-react";

interface InvoiceJSONProps {
  title: string;
  data: any;
}

export function InvoiceJSON({ title, data }: InvoiceJSONProps) {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-slate-200 p-2 rounded-lg">
            <Code2 className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <h4 className="text-slate-900">{title}</h4>
            <p className="text-slate-500 text-sm">JSON para debug/integración</p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors text-sm"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-600" />
              <span className="text-slate-700">Copiar</span>
            </>
          )}
        </button>
      </div>

      <div className="p-6">
        <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto">
          <pre className="text-sm text-slate-100 font-mono leading-relaxed">{jsonString}</pre>
        </div>
      </div>
    </div>
  );
}
