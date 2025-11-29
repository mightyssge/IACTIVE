import { InvoiceFinal } from "./types";

type StoredInvoice = {
  invoice: InvoiceFinal;
  html: string;
  pdfPath?: string;
};

const store: Record<string, StoredInvoice> = {};

export function saveInvoice(data: StoredInvoice): string {
  const id = data.invoice.encabezado.id_interno;
  store[id] = data;
  return id;
}

export function getInvoice(id: string): StoredInvoice | undefined {
  return store[id];
}

export function listInvoices(limit = 10): InvoiceFinal[] {
  return Object.values(store)
    .map((entry) => entry.invoice)
    .sort((a, b) => (a.encabezado.id_interno < b.encabezado.id_interno ? 1 : -1))
    .slice(0, limit);
}
