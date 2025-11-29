export interface LlmItem {
  descripcion: string;
  cantidad: number | null;
  precio_unitario: number | null;
}

export interface LlmCliente {
  nombre_razon_social: string | null;
  tipo_documento: string | null;
  numero_documento: string | null;
  direccion?: string | null;
}

export interface LlmDraft {
  raw_text: string;
  cliente: LlmCliente;
  tipo_comprobante: string | null;
  moneda: string | null;
  items: LlmItem[];
  observaciones: string | null;
  inconsistencias_detectadas: string[];
}

export interface NormalizedItem {
  item: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  importe: number;
}

export interface InvoiceFinal {
  encabezado: {
    id_interno: string;
    tipo_comprobante: string;
    serie: string;
    numero: string;
    fecha_emision: string;
    moneda: string;
  };
  emisor: {
    ruc: string;
    razon_social: string;
    direccion: string;
  };
  cliente: {
    tipo_documento: string;
    numero_documento: string;
    nombre_razon_social: string;
    direccion: string | null;
  };
  items: NormalizedItem[];
  totales: {
    neto: number;
    tasa_igv: number;
    igv: number;
    total: number;
  };
  metadata: {
    source_text: string;
    warnings: string[];
  };
}

export interface DraftNormalized {
  encabezado: {
    moneda: string;
  };
  cliente: {
    tipo_documento: string;
    numero_documento: string;
    nombre_razon_social: string;
    direccion: string | null;
  };
  items: {
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
  }[];
  inconsistencias_detectadas: string[];
  observaciones: string | null;
}
