from pydantic import BaseModel, Field, conlist, confloat
from typing import List, Optional


class Cliente(BaseModel):
    nombre_razon_social: Optional[str] = None
    tipo_documento: Optional[str] = Field(
        None, description="RUC si se trata de empresa, DNI para persona natural"
    )
    numero_documento: Optional[str] = None
    direccion: Optional[str] = None


class Item(BaseModel):
    descripcion: str
    cantidad: confloat(gt=0) | None = None
    precio_unitario: confloat(ge=0) | None = None


class InvoiceDraft(BaseModel):
    raw_text: str
    cliente: Cliente
    tipo_comprobante: Optional[str] = Field(
        None, description="FACTURA o BOLETA sugerida"
    )
    moneda: Optional[str] = "PEN"
    items: conlist(Item, min_items=1)
    observaciones: Optional[str] = None
    inconsistencias_detectadas: List[str] = []


class ParseRequest(BaseModel):
    texto: str
    config: Optional[dict] = None
