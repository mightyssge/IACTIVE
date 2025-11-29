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


def _build_model(moneda_default: str):
    """
    Selecciona modelo:
    - OpenAI si OPENAI_API_KEY está definido.
    - Ollama local (por ejemplo, llama3) si no hay OpenAI.
    - Mock determinista si no hay ninguno disponible.
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
        # Fallback determinista mínimo para demo offline
        def _mock_structured_output(data):
            return InvoiceDraft(**data)

        class Mock:
            def invoke(self, values):
                texto = values["texto"]
                return InvoiceDraft(
                    raw_text=texto,
                    cliente={
                        "nombre_razon_social": "Cliente Desconocido",
                        "tipo_documento": "RUC",
                        "numero_documento": None,
                    },
                    tipo_comprobante="FACTURA",
                    moneda=moneda_default,
                    items=[
                        {
                            "descripcion": texto[:30] or "Item",
                            "cantidad": 1,
                            "precio_unitario": 0,
                        }
                    ],
                    observaciones="Modo mock: sin LLM real",
                    inconsistencias_detectadas=["Respuesta generada sin LLM real."],
                )

        return Mock()


def run_llm_parser(texto: str, tasa_igv: Optional[float] = None, moneda_default: str = "PEN") -> InvoiceDraft:
    prompt = ChatPromptTemplate.from_template(
        """
Eres un asistente que extrae datos de facturación de texto libre.
Devuelve SOLO el JSON con el modelo indicado. NO calcules totales ni IGV.
- tipo_comprobante: FACTURA si hay RUC, sino BOLETA.
- moneda: usa {moneda_default} si no se menciona.
- items: cada item debe tener descripcion, cantidad y precio_unitario si se menciona.
- inconsistencias_detectadas: lista de strings si el texto es ambiguo o incompleto.

Texto: {texto}
        """
    )

    runnable = prompt | _build_model(moneda_default)
    result: InvoiceDraft = runnable.invoke(
        {"texto": texto, "moneda_default": moneda_default, "tasa_igv": tasa_igv}
    )
    return result
