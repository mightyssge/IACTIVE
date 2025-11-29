import Handlebars from "handlebars";
import { InvoiceFinal } from "./types";

const templateSource = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Factura {{encabezado.id_interno}}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; }
    h1 { margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f4f4f4; }
    .totales { margin-top: 16px; width: 50%; }
  </style>
</head>
<body>
  <h1>Factura {{encabezado.serie}}-{{encabezado.numero}}</h1>
  <p><strong>Fecha:</strong> {{encabezado.fecha_emision}} | <strong>Moneda:</strong> {{encabezado.moneda}}</p>
  <h3>Emisor</h3>
  <p>{{emisor.razon_social}} - RUC {{emisor.ruc}}<br/>{{emisor.direccion}}</p>
  <h3>Cliente</h3>
  <p>{{cliente.nombre_razon_social}} ({{cliente.tipo_documento}} {{cliente.numero_documento}})</p>
  {{#if cliente.direccion}}<p>{{cliente.direccion}}</p>{{/if}}
  <h3>Items</h3>
  <table>
    <thead>
      <tr><th>#</th><th>Descripción</th><th>Cant.</th><th>Precio Unit.</th><th>Importe</th></tr>
    </thead>
    <tbody>
      {{#each items}}
        <tr>
          <td>{{item}}</td>
          <td>{{descripcion}}</td>
          <td>{{cantidad}}</td>
          <td>{{precio_unitario}}</td>
          <td>{{importe}}</td>
        </tr>
      {{/each}}
    </tbody>
  </table>
  <table class="totales">
    <tr><th>Neto</th><td>{{totales.neto}}</td></tr>
    <tr><th>IGV ({{totales.tasa_igv}})</th><td>{{totales.igv}}</td></tr>
    <tr><th>Total</th><td>{{totales.total}}</td></tr>
  </table>
  {{#if metadata.warnings.length}}
  <p><strong>Advertencias:</strong></p>
  <ul>
    {{#each metadata.warnings}}
      <li>{{this}}</li>
    {{/each}}
  </ul>
  {{/if}}
</body>
</html>
`;

const template = Handlebars.compile<InvoiceFinal>(templateSource);

export function renderInvoiceHtml(invoice: InvoiceFinal): string {
  return template(invoice);
}
