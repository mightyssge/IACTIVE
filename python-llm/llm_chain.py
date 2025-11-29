"""
LangChain chain to extract an invoice draft from free text.
The LLM ONLY does semantic parsing; all calculations happen in the Node backend.
"""

import os
import re
from typing import Optional
from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ChatOllama
from langchain.prompts import ChatPromptTemplate
from models import InvoiceDraft


def _build_model():
  """
  Choose model:
  - OpenAI if OPENAI_API_KEY is set.
  - Ollama local if no OpenAI key.
  - None if nothing available (fallback mock).
  """
  if os.getenv("OPENAI_API_KEY"):
    return ChatOpenAI(
      model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
      temperature=0,
      api_key=os.getenv("OPENAI_API_KEY"),
    ).with_structured_output(InvoiceDraft)

  ollama_model = os.getenv("OLLAMA_MODEL", "llama3")
  try:
    return ChatOllama(
      model=ollama_model,
      temperature=0,
    ).with_structured_output(InvoiceDraft)
  except Exception:
    return None


def _fallback_parse(texto: str, moneda_default: str = "PEN") -> InvoiceDraft:
  """Minimal deterministic parser for offline mode only."""
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
    observaciones="Modo fallback: sin LLM",
    inconsistencias_detectadas=["Respuesta generada sin LLM real."],
  )


def run_llm_parser(texto: str, tasa_igv: Optional[float] = None, moneda_default: str = "PEN") -> InvoiceDraft:
  model = _build_model()

  # Fallback determinista sin LLM (solo si no hay modelo disponible)
  if model is None:
    return _fallback_parse(texto, moneda_default)

  prompt = ChatPromptTemplate.from_template(
    """
Eres un asistente que extrae datos de facturación de texto libre y devuelves SOLO el JSON InvoiceDraft. No calcules totales ni IGV.
- cliente.nombre_razon_social: copia literal el nombre de empresa/persona que aparezca después de "a"/"para" (ej. "ACME SAC", "Globant Perú"). Si no encuentras nombre, deja null (no pongas "Cliente Desconocido").
- cliente.numero_documento: si hay un número de 11 dígitos en el texto, úsalo como RUC; si no hay, deja null. No inventes.
- tipo_comprobante: FACTURA si hay RUC, BOLETA si no hay RUC.
- moneda: usa {moneda_default} si no se menciona.
- items: cada item DEBE tener descripcion breve (ej. "laptop", "mouse", "horas de consultoría"), cantidad y precio_unitario. Usa valores explícitos; si están implícitos, infiérelos (ej. "12 horas a 180 USD/hora" => cantidad 12, precio_unitario 180). No dejes null.
- inconsistencias_detectadas: lista de strings si el texto es ambiguo o incompleto.

Ejemplo 1:
Texto: "Genera una factura a ACME SAC por 2 laptops a 2500 cada una y 1 mouse a 80 soles con RUC 21485393265"
Salida resumida: cliente.nombre_razon_social="ACME SAC", cliente.numero_documento="21485393265", items=[
  {"descripcion": "laptops", "cantidad": 2, "precio_unitario": 2500},
  {"descripcion": "mouse", "cantidad": 1, "precio_unitario": 80}
]

Ejemplo 2:
Texto: "Factura a Globant Perú por 12 horas de consultoría a 180 USD/hora y 1 licenciamiento anual a 1200 USD"
Salida resumida: cliente.nombre_razon_social="Globant Perú", items=[
  {"descripcion": "horas de consultoría", "cantidad": 12, "precio_unitario": 180},
  {"descripcion": "licenciamiento anual", "cantidad": 1, "precio_unitario": 1200}
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
