import React from 'react';
import { Building2, Calendar, FileText, Download } from 'lucide-react';

interface InvoiceItem {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

interface Invoice {
  numeroFactura: string;
  fecha: string;
  cliente: string;
  ruc: string;
  items: InvoiceItem[];
  subtotal: number;
  igv: number;
  total: number;
}

interface InvoicePreviewProps {
  invoice: Invoice;
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toFixed(2)}`;
  };

  const handleDownload = () => {
    // Simular descarga
    alert('Descarga de factura en desarrollo. En producción, esto generaría un PDF.');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white">Factura Electrónica</h3>
              <p className="text-blue-100 text-sm">{invoice.numeroFactura}</p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Descargar</span>
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* Cliente Info */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-slate-100 p-2 rounded-lg mt-0.5">
                <Building2 className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Cliente</p>
                <p className="text-slate-900">{invoice.cliente}</p>
              </div>
            </div>
            <div className="pl-11">
              <p className="text-slate-500 text-sm">RUC</p>
              <p className="text-slate-900">{invoice.ruc}</p>
            </div>
          </div>
          <div>
            <div className="flex items-start gap-3">
              <div className="bg-slate-100 p-2 rounded-lg mt-0.5">
                <Calendar className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Fecha de emisión</p>
                <p className="text-slate-900">{invoice.fecha}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h4 className="text-slate-900 mb-4">Detalle de la factura</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-slate-600 text-sm py-3 px-4 bg-slate-50 rounded-tl-lg">
                    Descripción
                  </th>
                  <th className="text-center text-slate-600 text-sm py-3 px-4 bg-slate-50">
                    Cant.
                  </th>
                  <th className="text-right text-slate-600 text-sm py-3 px-4 bg-slate-50">
                    P. Unit.
                  </th>
                  <th className="text-right text-slate-600 text-sm py-3 px-4 bg-slate-50 rounded-tr-lg">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <p className="text-slate-900">{item.descripcion}</p>
                    </td>
                    <td className="py-4 px-4 text-center text-slate-700">
                      {item.cantidad}
                    </td>
                    <td className="py-4 px-4 text-right text-slate-700">
                      {formatCurrency(item.precioUnitario)}
                    </td>
                    <td className="py-4 px-4 text-right text-slate-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-600">Subtotal</span>
              <span className="text-slate-900">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-600">IGV (18%)</span>
              <span className="text-slate-900">{formatCurrency(invoice.igv)}</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 rounded-xl">
              <span className="text-slate-900">Total</span>
              <span className="text-slate-900">
                {formatCurrency(invoice.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-slate-50 rounded-xl">
          <p className="text-slate-600 text-sm">
            ✓ Esta es una factura electrónica generada de manera automática. Válida según normativa SUNAT.
          </p>
        </div>
      </div>
    </div>
  );
}
