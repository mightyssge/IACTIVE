import { DraftNormalized, LlmDraft } from "./types";

const DEFAULT_MONEDA = process.env.MONEDA_DEFAULT || "PEN";
const DEFAULT_DOC_TIPO = "RUC";

function simulateRuc(): string {
  // Simple deterministic 11-digit fallback
  return "2" + Math.random().toString().slice(2, 12);
}

export function normalizeDraft(
  draft: LlmDraft,
  config?: { moneda_default?: string }
): { normalized: DraftNormalized; warnings: string[] } {
  const warnings: string[] = [];
  const moneda = draft.moneda || config?.moneda_default || DEFAULT_MONEDA;

  const clienteTipoDoc = draft.cliente?.tipo_documento || DEFAULT_DOC_TIPO;
  let clienteRuc = draft.cliente?.numero_documento;
  if (!clienteRuc || clienteRuc.length < 8) {
    clienteRuc = simulateRuc();
    warnings.push("RUC del cliente fue simulado porque no se proporcionó o era inválido.");
  }
  if (clienteRuc.length !== 11) {
    warnings.push("RUC del cliente no tiene 11 dígitos; se usó valor provisto sin validar.");
  }

  const items = (draft.items || []).map((item, idx) => {
    let cantidad = Number(item.cantidad ?? 0);
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      warnings.push(`Cantidad no válida en item ${idx + 1}; se forzó a 1.`);
      cantidad = 1;
    }
    let precio = Number(item.precio_unitario ?? 0);
    if (!Number.isFinite(precio) || precio < 0) {
      warnings.push(`Precio no válido en item ${idx + 1}; se forzó a 0.`);
      precio = 0;
    }
    return {
      descripcion: item.descripcion || `Item ${idx + 1}`,
      cantidad,
      precio_unitario: precio,
    };
  });

  const normalized: DraftNormalized = {
    encabezado: { moneda },
    cliente: {
      tipo_documento: clienteTipoDoc,
      numero_documento: clienteRuc,
      nombre_razon_social: draft.cliente?.nombre_razon_social || "Cliente",
      direccion: draft.cliente?.direccion ?? null,
    },
    items,
    inconsistencias_detectadas: draft.inconsistencias_detectadas || [],
    observaciones: draft.observaciones,
  };

  return { normalized, warnings };
}
