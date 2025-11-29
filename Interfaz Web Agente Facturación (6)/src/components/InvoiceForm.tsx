import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface InvoiceFormProps {
  onGenerate: (description: string) => void;
  isGenerating: boolean;
}

export function InvoiceForm({ onGenerate, isGenerating }: InvoiceFormProps) {
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onGenerate(description);
    }
  };

  const exampleDescriptions = [
    "Genera una factura por servicios de consultoría y desarrollo",
    "Factura de mantenimiento y soporte técnico",
    "Productos de oficina y equipamiento"
  ];

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
      <div className="mb-8">
        <h2 className="text-slate-900 mb-2">Generar Factura Electrónica</h2>
        <p className="text-slate-600">
          Describe en lenguaje natural los servicios o productos que deseas facturar y nuestro agente generará automáticamente tu factura SUNAT.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="description" className="block text-slate-700 mb-2">
            Descripción de la factura
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Necesito facturar 10 horas de consultoría a S/150 por hora, 5 licencias de software a S/800 cada una y 3 meses de soporte técnico a S/250 mensuales..."
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
            rows={8}
            disabled={isGenerating}
          />
          <p className="text-slate-500 text-sm mt-2">
            {description.length}/500 caracteres
          </p>
        </div>

        {/* Example suggestions */}
        <div>
          <p className="text-slate-600 text-sm mb-3">Ejemplos de descripción:</p>
          <div className="space-y-2">
            {exampleDescriptions.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setDescription(example)}
                className="w-full text-left px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm rounded-lg transition-colors border border-slate-200"
                disabled={isGenerating}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!description.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generando factura...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generar factura
            </>
          )}
        </button>
      </form>

      {/* Info box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-blue-800 text-sm">
          <span className="font-medium">💡 Tip:</span> Sé específico con cantidades, precios y descripciones para obtener una factura más precisa.
        </p>
      </div>
    </div>
  );
}
