const fs = require('fs');
const path = 'd:/Projetos de websites/Bochel Microcredito/src/utils/exportUtils.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace the CSS
content = content.replace(
  '.signature-area { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 10px; }',
  '.signature-area { display: flex; justify-content: flex-end; margin-top: 50px; padding-top: 10px; }'
);

// Remove 'O Cliente' from Invoice
content = content.replace(
  '<div class="signature-area">\n    <div class="sig-box"><div class="sig-line">O Cliente</div></div>\n    <div class="sig-box"><div class="sig-line">A Empresa</div></div>\n  </div>',
  '<div class="signature-area">\n    <div class="sig-box" style="width:40%"><div class="sig-line">A Empresa</div></div>\n  </div>'
);

// Remove 'O Cliente' from Receipt
content = content.replace(
  '<div class="signature-area">\n    <div class="sig-box"><div class="sig-line">O Cliente</div></div>\n    <div class="sig-box"><div class="sig-line">Recebido por</div></div>\n  </div>',
  '<div class="signature-area">\n    <div class="sig-box" style="width:40%"><div class="sig-line">A Empresa / Recebido por</div></div>\n  </div>'
);

// Remove 'Assinatura do Cliente' from Credit Request
content = content.replace(
  '<div class="signature-area">\n    <div class="sig-box"><div class="sig-line">Assinatura do Cliente</div></div>\n    <div class="sig-box"><div class="sig-line">Analista de Crédito</div></div>\n  </div>',
  '<div class="signature-area">\n    <div class="sig-box" style="width:40%"><div class="sig-line">Analista de Crédito</div></div>\n  </div>'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed signatures in exportUtils.ts');
