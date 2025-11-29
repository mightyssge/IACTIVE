import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import ParseRequest, InvoiceDraft
from llm_chain import run_llm_parser
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Microservicio LLM - Parsing de Facturas")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "model": "langchain"}


@app.post("/parse-invoice", response_model=InvoiceDraft)
def parse_invoice(req: ParseRequest):
    try:
        draft = run_llm_parser(
            texto=req.texto,
            tasa_igv=req.config.get("tasa_igv") if req.config else None,
            moneda_default=req.config.get("moneda_default") if req.config else "PEN",
        )
        return draft
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
