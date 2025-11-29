import { DraftNormalized, LlmDraft } from "./types";

const DEFAULT_MONEDA = process.env.MONEDA_DEFAULT || "PEN";
const DEFAULT_DOC_TIPO = "RUC";

function simulateRuc(): string {
  // Simple deterministic 11-digit fallback
  return "2" + Math.random().toString().slice(2, 12);
}

// Intento determinista de extraer items desde texto libre cuando el LLM no entrega precios/cantidades.
function parseItemsFromText(
  rawText: string,
  monedaFromDraft?: string
): { descripcion: string; cantidad: number; precio_unitario: number }[] {
  const regex =
    /(?<cant>\d+(?:[.,]\d+)?)\s*(?:horas?|licencias?|unidades?|u\.?|items?)?(?:\s+de\s+[\w\s/áéíóúñÁÉÍÓÚÑ-]{0,50})?(?:a|@)\s*(?<precio>\d+(?:[.,]\d+)?)(?:\s*(?<moneda>USD|usd|S\/|PEN|pen|soles?))?/gi;
  const items: { descripcion: string; cantidad: number; precio_unitario: number }[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(rawText)) !== null) {
    const cant = parseFloat(match.groups?.cant?.replace(",", ".") || "0") || 0;
    const precio = parseFloat(match.groups?.precio?.replace(",", ".") || "0") || 0;
    const desc = match[0]?.trim().slice(0, 120) || rawText.slice(0, 120);
    items.push({
      descripcion: desc,
      cantidad: cant > 0 ? cant : 1,
      precio_unitario: precio >= 0 ? precio : 0,
    });
    // si encuentra moneda explícita, podría sobreescribir monedaFromDraft pero aquí solo devolvemos items
  }
  return items;
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

  let items = (draft.items || []).map((item, idx) => {
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

  // Si los items quedaron sin precios o son vacíos, intenta un parseo regex sobre el texto original.
  const hasUsefulPrice = items.some((it) => Number.isFinite(it.precio_unitario) && it.precio_unitario > 0);
  if ((!items.length || !hasUsefulPrice) && draft.raw_text) {
    const parsed = parseItemsFromText(draft.raw_text, moneda);
    if (parsed.length) {
      items = parsed;
      warnings.push("Se usó parser determinista para extraer cantidades y precios del texto.");
    }
  }

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
