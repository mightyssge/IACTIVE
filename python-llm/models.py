from pydantic import BaseModel, Field, confloat
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
    items: List[Item]
    observaciones: Optional[str] = None
    inconsistencias_detectadas: List[str] = []

    @classmethod
    def validate_items(cls, value):
        if not value or len(value) == 0:
            raise ValueError("items debe tener al menos un elemento")
        return value

    # Compatibilidad Pydantic v1 y v2 para validar lista no vacía
    try:
        from pydantic import validator  # type: ignore

        _validate_items = validator("items", allow_reuse=True)(validate_items)
    except Exception:
        # Pydantic v2
        try:
            from pydantic import model_validator  # type: ignore

            @model_validator(mode="before")
            def _validate_items_v2(cls, values):
                items = values.get("items")
                cls.validate_items(items)
                return values
        except Exception:
            pass


class ParseRequest(BaseModel):
    texto: str
    config: Optional[dict] = None
