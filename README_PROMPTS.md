# Documentación de Prompts: Agente de Facturación Electrónica Tipo SUNAT

## Contenido

- Introducción  
- Descripción General  
- Prompts de Desarrollo  
  - Prompts para Generación del Backend  
    - Prompt 1: Diseño de Arquitectura Técnica  
    - Promt 2  
    - Prompt 3  
    - Prompt 4: Implementación con Stack Específico  
  - Prompt para Generación del Frontend  
    - Prompt 1: Diseño de Interfaz con Figma Maker  
    - Prompt 2  
    - Promt 3  
- Código Python  
- Código HTTP  
- JSON de prueba  
- Conclusiones  

---

## Introducción

**Documentación de Prompts: Agente de Facturación Electrónica Tipo SUNAT**

Este repositorio documenta los prompts, código base y contexto utilizados para construir un agente de facturación electrónica estilo SUNAT, desarrollado en el marco de un workshop/hackathon.

---

## Descripción General

El agente de facturación genera comprobantes tipo SUNAT, valida RUC, calcula impuestos y responde consultas relacionadas a facturación electrónica.  
Este documento presenta la colección completa de prompts utilizados para el desarrollo del sistema, organizados según su función específica en la arquitectura del proyecto.

---

## Prompts de Desarrollo

### Prompts para Generación del Backend

#### Prompt 1: Diseño de Arquitectura Técnica

Actúa como un arquitecto de software senior especializado en sistemas de facturación electrónica y asistentes GENAI.
Quiero que DISEÑES la ARQUITECTURA TÉCNICA de la siguiente solución para una hackathon:
tengo este workshop/hackaton de NTT Data y necesito que me ayudes con lo que me piden para desarrollar

Hackathon_GENAI.docx 1 / 6 NTTDATA IACTIVA 2025 Workshop Retos: CRM INTELIGENTE AGENTE DE FACTURACIÓN SUNAT GEN.IA GEN.IA.Peru@emeal.nttdata.com 2 / 6

Reto 1 – CRM INTELIGENTE: OPTIMIZANDO CAMPAÑAS DE VENTAS CON IA
Construye una web donde se visualice las campañas que un AGENTE, dado un cliente, investigue informacion simuladas de Facebook/Instagram, segmente por sector/historial/consumo y seleccione/compile automáticamente una campaña. El agente decide y ejecuta el flujo de forma autónoma con botones/inputs mínimos.

Objetivo del reto
· Una web donde se visualice las campañas que se ofrecen a un cliente de cualquier sector.
· Crear un agente que opere con un loop de decisiones.
· Entradas: CSV pequeño de clientes + API/MCP simulada de señales sociales (mock) o real.
· Acciones: 1) consultar informacion de redes simuladas; 2) segmentar; 3) elegir campaña; 4) generar salida (JSON/HTML) lista para enviar.

Restricciones
· No scraping real ni uso de datos personales reales. Señales sociales deben ser simuladas o de ejemplo.
· Sin prompts libres del usuario. La UI solo permite seleccionar cliente(s) y ejecutar el agente.
· El agente puede usar reglas determinísticas. Si usan GenAI, debe ser interno (prompts embebidos en el código).

Arquitectura propuesta (mínima)
Módulo              Descripción                                           I/O
Orquestador (FSM)   Controla estados: INGESTA → PERFIL → SEGMENTO → CAMPAÑA → SALIDA
                    Entrada: id_cliente; Salida: artefactos
Herramienta: PerfiladorSocialMock
                    Retorna intereses/tono/actividad simulados por red_social
                    Input: id_cliente; Output: JSON señales
Segmentador         Reglas sobre sector, riesgo, gasto_promedio y señales
                    Input: features; Output: segmento
Decisor de Campaña  Selecciona plantilla y CTA según segmento
                    Input: segmento; Output: campaña
Compositor          Construye mensaje final + JSON exportable y vista HTML
                    Input: campaña + cliente; Output: HTML/JSON

Diagrama de estados (texto)
INGESTA → PERFIL → SEGMENTO → CAMPAÑA → SALIDA → (FIN)
En caso de error: cualquier estado → ERROR → LOG → FIN

Esquemas de datos
CSV de clientes (ejemplo)
columna        tipo    ejemplo
id_cliente     string  C001
nombre         string  María López
sector         string  retail
gasto_promedio float   350.5
riesgo         string  medio
red_social     string  instagram

Interfaz mínima (sugerida)
· Lista desplegable para elegir cliente o checkbox para procesar todos.
· Botón: 'Ejecutar agente'.
· Panel de logs por estado (INGESTA, PERFIL, SEGMENTO, CAMPAÑA, SALIDA).
· Vista de resultados: tabla y exportar JSON/CSV/HTML.

Criterios de aceptación
· El agente ejecuta el flujo completo sin prompts manuales.
· Mínimo 2 segmentos y 3 plantillas de campaña distintas.
· Exporta JSON/CSV/HTML y muestra logs por estado.
· Usa datos y señales simuladas (sin scraping real).

Puntos extra (opcionales)
· Memoria corta por cliente (persistencia simple de decisiones).
· Selector de canal por reglas (email/sms/dm simulado).
· Métricas simuladas: CTR/abiertos por segmento.

Ética y cumplimiento
· Evitar datos personales reales. Explicar en README que es un demo educativo.
· No violar términos de servicio de redes sociales.
· Si se integra GenAI internamente, documentar prompts embebidos y filtros de seguridad.

Reto 2 (simple): Agente de Facturación estilo SUNAT
Crea un asistente que, desde texto natural, arme el borrador de una factura/boleta en JSON y una vista previa HTML/PDF sencilla.

Objetivo (alcanzable en 4h)
· Entrada de lenguaje natural (ej.: “genera una factura a ACME por 2 ítems…”).
· Extraer cliente, RUC (simulado, 11 dígitos), ítems, precios, IGV 18% y total.
· Generar JSON estructurado y representación en HTML/PDF simple.
· Sin conexión real con SUNAT; validaciones básicas simuladas.

Datos y supuestos
· RUC simulado: 11 dígitos.
· IGV 18% (parametrizable).
· Ítems: descripción, cantidad, precio; total = suma + IGV.

Flujo sugerido
1. Usuario describe la factura en lenguaje natural.
2. GENAI ayuda a estructurar campos y detectar inconsistencias sencillas.
3. Cálculo de neto, IGV y total.
4. Render HTML o exportación PDF básica.

Criterios de aceptación
· Extracción razonable de campos desde lenguaje natural.
· Cálculo correcto de IGV y totales (casos simples).
· Vista previa legible y JSON exportable.

Checklist de entregables
· Demo (local o video corto).
· README con instrucciones y descripción.
· Datos de ejemplo (CSV/JSON).
· Exportaciones (CSV/JSON/HTML o PDF simple).

Buenas prácticas y ética
· Usar datos ficticios y respetar la privacidad.
· Citar fuentes si reutilizan ejemplos o plantillas.
· Cuidar el tono y evitar sesgos u ofensas.

Rúbrica de evaluación para ambos retos (100 pts)
Criterio                 Puntaje
MVP funcional            40
Interfaz/claridad de demo 20
Uso adecuado de GENAI    20
Calidad técnica básica   10
Creatividad y extras     10
Se trata de esto

Primero dime que programas necesito instalar para hacer todo lo que me pidan en su totalidad y además una descripción de lo que tengo que hacer, ósea los objetivos que debo llegar, y también las configuraciones que debo hacer para que el desarrollo del proyecto sea más ameno.

Dame una lista puntual de los requerimientos que piden cumplir del problema SUNAT, luego dime como proceder ya que ya termine de instalar todo lo que me dijiste, también dime si necesito extensiones o configuraciones adicionales según el caso, no tengo todavia ningun archivo creado y tambien dime como dividir la carga de trabajo a 4 personas.

Dame una lista de querys para probar el agente que me diste.


#### Promt 2

Me salió un Back End base, pero me pide funcionalidades y características adicionales, como mejorar el front, darle la capacidad de descargar en PDF y también dame una lista adicional de consultas para probar el agente.


#### Prompt 3

ayudame a corregir algunos errores en mi codigo de ejercicio, aqui va la descripcion del ejercicio (yo hare SUNAT):


#### Prompt 4 – Implementación con Stack Específico

Deberíamos usar un stack parecido: Python (LangChain) y Node.js. Genérame un prompt completo para consultarle a Codex y que también me incluya por completo lo considerado en la siguiente rúbrica:
• MVP funcional: 40 puntos
• Interfaz/claridad de demo: 20 puntos
• Uso adecuado de GENAI: 20 puntos
• Calidad técnica básica: 10 puntos
• Creatividad y extras: 10 puntos


## Prompt para Generación del Frontend

#### Prompt 1: Diseño de Interfaz con Figma Maker

Genera una interfaz web minimalista, moderna y clara para el "Agente de Facturación SUNAT (Demo)": un layout con dos columnas donde la izquierda contiene un título, un subtítulo, un formulario con un textarea para ingresar la descripción en lenguaje natural y un botón principal estilizado "Generar factura", y la derecha muestra una tarjeta limpia con la vista previa de la factura (cliente, RUC, tabla de ítems con estilo moderno, subtotal, IGV y total) junto a otra tarjeta con el JSON exportable en un bloque tipo código; usa colores suaves, bordes redondeados, sombras ligeras, tipografía moderna (Inter/Roboto), buena jerarquía visual, espaciados amplios y diseño totalmente responsivo.


#### Prompt 2

Teniendo en cuenta el código de mi back end, mejora la interfaz brindada.

#### Promt 3

Quiero que me des el botón de cambiar a modo oscuro y modo claro, algo sencillo minimalista pero funcional.

---

## Código Python

```
from flask import Flask, render_template, request, jsonify
import re
import json

app = Flask(__name__)

IGV_RATE = 0.18  # 18%

def extraer_datos(texto):
    cliente = "CLIENTE DEMO"
    ruc = "12345678901"
    items = [{
        "descripcion": "Servicio/Producto demo",
        "cantidad": 1,
        "precio": 100.0
    }]
    subtotal = sum(i["cantidad"] * i["precio"] for i in items)
    igv = round(subtotal * IGV_RATE, 2)
    total = round(subtotal + igv, 2)

    return {
        "cliente": cliente,
        "ruc": ruc,
        "items": items,
        "subtotal": subtotal,
        "igv": igv,
        "total": total
    }

@app.route("/", methods=["GET", "POST"])
def index():
    factura = None
    json_factura = None
    if request.method == "POST":
        descripcion = request.form.get("descripcion", "")
        factura = extraer_datos(descripcion)
        json_factura = json.dumps(factura, indent=2, ensure_ascii=False)
    return render_template("index.html", factura=factura, json_factura=json_factura)

@app.route("/api/factura", methods=["POST"])
def api_factura():
    data = request.get_json()
    descripcion = data.get("descripcion", "")
    factura = extraer_datos(descripcion)
    return jsonify(factura)

if __name__ == "__main__":
    app.run(debug=True)
```

---


## JSON de prueba

```
{
  "cliente": "INVERSIONES NARUTO SAC",
  "ruc": "20654321987",
  "items": [
    { "descripcion": "licencias de software empresarial", "cantidad": 3, "precio_unitario": 350 },
    { "descripcion": "servicios de instalacion avanzada", "cantidad": 2, "precio_unitario": 500 },
    { "descripcion": "mantenimiento anual premium", "cantidad": 1, "precio_unitario": 1200 }
  ],
  "moneda": "PEN",
  "subtotal": 3250,
  "igv": 585,
  "total": 3835,
  "tasa_igv": 0.18
}
```

---

## Conclusiones

```
Efectividad de los Prompts Estructurados
Los prompts demuestran claridad, enfoque modular y orientación a resultados específicos, optimizando la generación asistida por IA.

Importancia de la Separación de Responsabilidades
La división entre arquitectura, backend, frontend y pruebas mejora la mantenibilidad y escalabilidad del sistema.

Énfasis en Restricciones y Buenas Prácticas
Se destacan los cuidados éticos, la gestión de datos ficticios y la evitación de cálculos complejos por parte de modelos de lenguaje.

Escalabilidad de la Metodología de Documentación
La estructura presentada sirve como plantilla replicable para proyectos futuros, integrando rúbricas, prompts especializados y organización clara del contenido.
```

