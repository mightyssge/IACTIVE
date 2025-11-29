import React from "react";
import { Building2, Calendar, FileText, Download, AlertTriangle } from "lucide-react";

interface InvoicePreviewProps {
  invoice: {
    encabezado: {
      id_interno: string;
      tipo_comprobante: string;
      serie: string;
      numero: string;
      fecha_emision: string;
      moneda: string;
    };
    emisor: { ruc: string; razon_social: string; direccion: string };
    cliente: { tipo_documento: string; numero_documento: string; nombre_razon_social: string; direccion: string | null };
    items: { item: number; descripcion: string; cantidad: number; precio_unitario: number; importe: number }[];
    totales: { neto: number; tasa_igv: number; igv: number; total: number };
  };
  pdfUrl: string;
  warnings?: string[];
}

export function InvoicePreview({ invoice, pdfUrl, warnings }: InvoicePreviewProps) {
  const formatCurrency = (amount: number) => `S/ ${amount.toFixed(2)}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white">Factura {invoice.encabezado.tipo_comprobante}</h3>
              <p className="text-blue-100 text-sm">
                {invoice.encabezado.serie}-{invoice.encabezado.numero} • {invoice.encabezado.moneda}
              </p>
            </div>
          </div>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Descargar PDF</span>
          </a>
        </div>
        <p className="text-blue-100 text-sm">ID interno: {invoice.encabezado.id_interno}</p>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-slate-100 p-2 rounded-lg mt-0.5">
                <Building2 className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Cliente</p>
                <p className="text-slate-900">{invoice.cliente.nombre_razon_social}</p>
                <p className="text-slate-700 text-sm">
                  {invoice.cliente.tipo_documento} {invoice.cliente.numero_documento}
                </p>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-start gap-3">
              <div className="bg-slate-100 p-2 rounded-lg mt-0.5">
                <Calendar className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Fecha de emisión</p>
                <p className="text-slate-900">{invoice.encabezado.fecha_emision}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-slate-900 mb-4">Detalle de la factura</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-slate-600 text-sm py-3 px-4 bg-slate-50 rounded-tl-lg">Ítem</th>
                  <th className="text-left text-slate-600 text-sm py-3 px-4 bg-slate-50">Descripción</th>
                  <th className="text-center text-slate-600 text-sm py-3 px-4 bg-slate-50">Cant.</th>
                  <th className="text-right text-slate-600 text-sm py-3 px-4 bg-slate-50">P. Unit.</th>
                  <th className="text-right text-slate-600 text-sm py-3 px-4 bg-slate-50 rounded-tr-lg">Importe</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.item} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-700">{item.item}</td>
                    <td className="py-3 px-4 text-slate-900">{item.descripcion}</td>
                    <td className="py-3 px-4 text-center text-slate-700">{item.cantidad}</td>
                    <td className="py-3 px-4 text-right text-slate-700">{formatCurrency(item.precio_unitario)}</td>
                    <td className="py-3 px-4 text-right text-slate-900">{formatCurrency(item.importe)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-600">Neto</span>
              <span className="text-slate-900">{formatCurrency(invoice.totales.neto)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-600">IGV ({invoice.totales.tasa_igv})</span>
              <span className="text-slate-900">{formatCurrency(invoice.totales.igv)}</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 rounded-xl">
              <span className="text-slate-900">Total</span>
              <span className="text-slate-900">{formatCurrency(invoice.totales.total)}</span>
            </div>
          </div>
        </div>

        {warnings && warnings.length > 0 && (
          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-900 text-sm flex gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Advertencias</p>
              <ul className="list-disc list-inside space-y-1">
                {warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
