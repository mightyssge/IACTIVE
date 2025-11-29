# Agente de Facturación estilo SUNAT (MVP Hackathon)

Sistema demo que convierte texto libre en borradores de facturas/boletas usando un microservicio LLM (solo parsing) y un backend determinista (validación, cálculos, HTML/PDF). Incluye frontend simple para probar end-to-end.

## Arquitectura rápida
- `python-llm/` (FastAPI + LangChain): `POST /parse-invoice` devuelve borrador JSON sin cálculos.
- `node-backend/` (Express): valida/normaliza, calcula neto/IGV/total, renderiza HTML, genera PDF, expone APIs.
- `frontend/` (HTML/JS): textarea + controles, muestra borrador LLM, factura final, vista HTML, descarga PDF/JSON y lista historial.
- `samples/`: ejemplos de borrador LLM y factura final.

### Separación IA vs Lógica determinista
- LLM (Python): solo interpreta el texto y devuelve estructura semántica (cliente, tipo, moneda, items, observaciones, inconsistencias). No calcula totales.
- Backend (Node): normaliza datos (RUC simulado, cantidades/precios válidos), fija moneda, calcula importes con `decimal.js`, renderiza HTML y PDF con Puppeteer. Todas las sumas se hacen con números deterministas.

## Requisitos
- Node.js >= 18
- Python >= 3.10
- Clave de API para LLM (OpenAI) en `OPENAI_API_KEY` (modo mock si no se define).

## Variables de entorno
- Node (`node-backend/.env.example`):
  - `PYTHON_LLM_URL=http://localhost:8000`
  - `IGV_RATE=0.18`
  - `EMISOR_RUC`, `EMISOR_RAZON_SOCIAL`, `EMISOR_DIRECCION`
- Python (`python-llm/.env.example`):
  - `OPENAI_API_KEY`
  - `PORT=8000`

## Instalación y ejecución
### 1) Microservicio LLM (Python)
```bash
cd python-llm
python -m venv .venv && .\.venv\Scripts\activate   # en Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
- Opción gratis/local (Ollama): instala Ollama, descarga un modelo ligero (`ollama run llama3`), y NO declares `OPENAI_API_KEY`. El servicio usará `ChatOllama` automáticamente (configurable con `OLLAMA_MODEL=llama3`).

### 2) Backend determinista (Node)
```bash
cd node-backend
cp .env.example .env   # ajustar valores
npm install
npm run dev            # o npm run start después de build
```

### 3) Frontend
Servir de forma estática:
```bash
cd frontend
python -m http.server 4173   # o npx serve
# abrir http://localhost:4173
```
Define la base del backend si es otro host/puerto:
```html
<script>window.API_BASE = "http://localhost:3000";</script>
```
o edita `frontend/app.js` (`API_BASE`).

## Flujo end-to-end
1. Frontend envía `texto` y `config` a `POST /api/invoices/from-text`.
2. Node llama a `POST python-llm/parse-invoice` y recibe `draft_llm` (sin totales).
3. Node normaliza datos, calcula neto/IGV/total, arma `invoice_final`, genera HTML y PDF.
4. Respuesta incluye: `draft_llm`, `draft_normalized`, `invoice_final`, `html_preview`, `pdf_url`, `warnings`.
5. Frontend muestra JSONs, render HTML y permite descargar PDF/JSON.

## Rutas principales (Node)
- `POST /api/invoices/from-text` → flujo completo.
- `GET /api/invoices/:id/pdf` → descarga PDF.
- `GET /api/invoices/:id/json` → descarga JSON final.
- `GET /api/invoices/history` → historial en memoria (extra creativo #1).

## Frontend (UI rápida)
- Textarea + tasa IGV editable (extra creativo #2).
- Botones de ejemplo precargados.
- Indicador visual si LLM devolvió `inconsistencias_detectadas`.
- Historial de últimas facturas y descarga JSON/PDF.

## Demo rápida (guion)
1. Abrir frontend, pegar ejemplo: “Genera una factura a ACME SAC por 2 laptops a 2500 cada una y 1 mouse a 80 soles”.
2. Click en “Generar borrador”.
3. Mostrar pestaña “Salida LLM (borrador)”.
4. Mostrar “Factura final (JSON)” y totales calculados.
5. Abrir “Descargar PDF” para enseñar el documento.

## Notas de calidad
- Errores devuelven HTTP 400 para input inválido y 500 si falla el LLM.
- Cálculo en centavos con `decimal.js` para evitar errores de punto flotante.
- PDF se guarda en `node-backend/tmp/` y se sirve vía endpoint.
- Modo mock en Python si no hay `OPENAI_API_KEY` para seguir la demo offline.

## Estructura
```
node-backend/
  src/server.ts           # Rutas Express
  src/llmClient.ts        # Cliente HTTP al microservicio LLM
  src/draftNormalizer.ts  # Normalización y warnings
  src/invoiceCalculator.ts# Cálculo determinista
  src/rendererHtml.ts     # Plantilla HTML
  src/rendererPdf.ts      # PDF con Puppeteer
  src/inMemoryStore.ts    # Historial en memoria
python-llm/
  main.py                 # FastAPI
  models.py               # Pydantic
  llm_chain.py            # LangChain + prompt
frontend/
  index.html, app.js, style.css
samples/
  draft_llm_example.json
  invoice_final_example.json
```
