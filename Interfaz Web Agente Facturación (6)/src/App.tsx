import React, { useState } from 'react';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { InvoiceJSON } from './components/InvoiceJSON';
import { FileText } from 'lucide-react';

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

export default function App() {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (description: string) => {
    setIsGenerating(true);
    
    // Simular generación de factura con un pequeño delay
    setTimeout(() => {
      const items: InvoiceItem[] = [
        {
          descripcion: "Servicio de consultoría empresarial",
          cantidad: 10,
          precioUnitario: 150.00,
          total: 1500.00
        },
        {
          descripcion: "Desarrollo de software personalizado",
          cantidad: 5,
          precioUnitario: 800.00,
          total: 4000.00
        },
        {
          descripcion: "Soporte técnico mensual",
          cantidad: 3,
          precioUnitario: 250.00,
          total: 750.00
        }
      ];

      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const igv = subtotal * 0.18;
      const total = subtotal + igv;

      const newInvoice: Invoice = {
        numeroFactura: `F001-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
        fecha: new Date().toLocaleDateString('es-PE', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        cliente: "Empresa Ejemplo S.A.C.",
        ruc: "20123456789",
        items,
        subtotal,
        igv,
        total
      };

      setInvoice(newInvoice);
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-slate-900">Agente de Facturación SUNAT</h1>
              <p className="text-slate-500 text-sm">Demo</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div>
            <InvoiceForm 
              onGenerate={handleGenerate} 
              isGenerating={isGenerating}
            />
          </div>

          {/* Right Column - Preview & JSON */}
          <div className="space-y-6">
            {invoice ? (
              <>
                <InvoicePreview invoice={invoice} />
                <InvoiceJSON invoice={invoice} />
              </>
            ) : (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
                <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-slate-900 mb-2">Sin factura generada</h3>
                <p className="text-slate-500 text-sm">
                  Completa el formulario y genera una factura para ver la vista previa aquí
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
