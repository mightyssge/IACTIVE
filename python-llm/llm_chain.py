"""
Cadena LangChain para extraer borrador de factura desde texto libre.
El LLM SOLO hace parsing semántico, no cálculos numéricos.

Prompt orientativo:
- Identifica cliente, tipo de comprobante (FACTURA/BOLETA), moneda y lista de items.
- No calcules totales ni IGV.
- Si hay dudas, marca en inconsistencias_detectadas.
"""

import os
from typing import Optional
from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ChatOllama
from langchain.prompts import ChatPromptTemplate
from models import InvoiceDraft
import re


def _build_model(moneda_default: str):
    """
    Selecciona modelo:
    - OpenAI si OPENAI_API_KEY está definido.
    - Ollama local (por ejemplo, llama3) si no hay OpenAI.
    - None si no hay ninguno disponible (para usar fallback determinista).
    """
    if os.getenv("OPENAI_API_KEY"):
        return ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            temperature=0,
            api_key=os.getenv("OPENAI_API_KEY"),
        ).with_structured_output(InvoiceDraft)

    # Opción gratuita/local: Ollama
    ollama_model = os.getenv("OLLAMA_MODEL", "llama3")
    try:
        return ChatOllama(
            model=ollama_model,
            temperature=0,
        ).with_structured_output(InvoiceDraft)
    except Exception:
        return None


def _fallback_parse(texto: str, moneda_default: str = "PEN") -> InvoiceDraft:
    """Parser determinista mínimo por regex para modo sin LLM."""
    pattern = re.compile(
        r"(?P<cant>\d+(?:[.,]\d+)?)\s*(?:horas?|unidades?|u\.?|items?|licencias?)?"
        r".{0,40}?(?:a|@)\s*(?P<precio>\d+(?:[.,]\d+)?)(?:\s*(?P<moneda>USD|usd|S/|PEN|pen|soles?))?",
        re.IGNORECASE,
    )
    items = []
    for match in pattern.finditer(texto):
        cant = float(match.group("cant").replace(",", "."))
        precio = float(match.group("precio").replace(",", "."))
        moneda = match.group("moneda")
        if moneda:
            moneda_default = moneda.upper().replace("SOLES", "PEN").replace("S/", "PEN")
        items.append(
            {
                "descripcion": match.group(0).strip()[:120],
                "cantidad": cant,
                "precio_unitario": precio,
            }
        )
    if not items:
        items = [
            {
                "descripcion": texto[:120] or "Item",
                "cantidad": 1,
                "precio_unitario": 0,
            }
        ]
    return InvoiceDraft(
        raw_text=texto,
        cliente={
            "nombre_razon_social": "Cliente Desconocido",
            "tipo_documento": "RUC",
            "numero_documento": None,
        },
        tipo_comprobante="FACTURA",
        moneda=moneda_default,
        items=items,
        observaciones="Modo fallback: parseo regex",
        inconsistencias_detectadas=[],
    )


def run_llm_parser(texto: str, tasa_igv: Optional[float] = None, moneda_default: str = "PEN") -> InvoiceDraft:
    model = _build_model(moneda_default)

    # Fallback determinista sin LLM (solo si no hay modelo disponible)
    if model is None:
        return _fallback_parse(texto, moneda_default)

    prompt = ChatPromptTemplate.from_template(
        """
Eres un asistente que extrae datos de facturación de texto libre.
Devuelve SOLO el JSON con el modelo indicado. NO calcules totales ni IGV.
- tipo_comprobante: FACTURA si hay RUC, sino BOLETA.
- moneda: usa {moneda_default} si no se menciona.
- items: cada item DEBE tener descripcion, cantidad y precio_unitario. Si el texto los menciona, toma esos valores; si no, INFIERE valores numéricos coherentes a partir del texto (ej. precio por unidad indicado). No dejes null.
- inconsistencias_detectadas: lista de strings si el texto es ambiguo o incompleto.

Ejemplo esperado:
Input: "Factura a Globant Perú por 12 horas de consultoría a 180 USD/hora y 1 licenciamiento anual a 1200 USD"
Output items: [
  { "descripcion": "12 horas de consultoría", "cantidad": 12, "precio_unitario": 180 },
  { "descripcion": "licenciamiento anual", "cantidad": 1, "precio_unitario": 1200 }
]

Texto: {texto}
        """
    )

    try:
        runnable = prompt | model
        result: InvoiceDraft = runnable.invoke(
            {"texto": texto, "moneda_default": moneda_default, "tasa_igv": tasa_igv}
        )
        return result
    except Exception:
        return _fallback_parse(texto, moneda_default)
