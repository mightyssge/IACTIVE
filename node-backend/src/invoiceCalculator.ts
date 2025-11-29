import Decimal from "decimal.js";
import { DraftNormalized, InvoiceFinal } from "./types";

const IGV_ENV = process.env.IGV_RATE;
const IGV_RATE = IGV_ENV ? Number(IGV_ENV) : 0.18;

const EMISOR = {
  ruc: process.env.EMISOR_RUC || "20123456789",
  razon_social: process.env.EMISOR_RAZON_SOCIAL || "Mi Empresa SAC",
  direccion: process.env.EMISOR_DIRECCION || "Av. Ficticia 123, Lima",
};

export function buildInvoice(
  normalized: DraftNormalized,
  sourceText: string,
  warnings: string[],
  options?: { tasaIgv?: number }
): InvoiceFinal {
  const tasaIgv = options?.tasaIgv ?? IGV_RATE;
  const serie = "F001";
  const numero = new Decimal(Math.floor(Math.random() * 100000))
    .toString()
    .padStart(6, "0");
  const fechaEmision = new Date().toISOString().slice(0, 10);
  const idInterno = `INV-${fechaEmision.replace(/-/g, "")}-${numero}`;

  const items = normalized.items.map((item, idx) => {
    const importe = new Decimal(item.cantidad).times(item.precio_unitario);
    return {
      item: idx + 1,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      importe: Number(importe.toFixed(2)),
    };
  });

  const neto = items.reduce(
    (acc, item) => acc.plus(item.importe),
    new Decimal(0)
  );
  const igv = neto.times(tasaIgv);
  const total = neto.plus(igv);

  const invoice: InvoiceFinal = {
    encabezado: {
      id_interno: idInterno,
      tipo_comprobante:
        normalized.cliente.tipo_documento?.toUpperCase() === "RUC"
          ? "FACTURA"
          : "BOLETA",
      serie,
      numero,
      fecha_emision: fechaEmision,
      moneda: normalized.encabezado.moneda,
    },
    emisor: EMISOR,
    cliente: normalized.cliente,
    items,
    totales: {
      neto: Number(neto.toFixed(2)),
      tasa_igv: tasaIgv,
      igv: Number(igv.toFixed(2)),
      total: Number(total.toFixed(2)),
    },
    metadata: {
      source_text: sourceText,
      warnings,
    },
  };

  return invoice;
}
