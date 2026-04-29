const fs = require('fs');
const path = 'd:/Projetos de websites/Bochel Microcredito/src/utils/exportUtils.ts';
let content = fs.readFileSync(path, 'utf8');

const replacements = {
    'ConcessÃ£o': 'Concessão',
    'CrÃ©dito': 'Crédito',
    'NÂº': 'Nº',
    'EmissÃ£o': 'Emissão',
    'EndereÃ§o': 'Endereço',
    'MoÃ§ambique': 'Moçambique',
    'DescriÃ§Ã£o': 'Descrição',
    'TransferÃªncia': 'Transferência',
    'BancÃ¡ria': 'Bancária',
    '1Âª': '1ª',
    'Âª': 'ª',
    'apÃ³s': 'após',
    'atravÃ©s': 'através',
    'impressÃ£o': 'impressão',
    'DossiÃª': 'Dossiê',
    'InformaÃ§Ãµes': 'Informações',
    'ObservaÃ§Ãµes': 'Observações',
    'ResidÃªncia': 'Residência',
    'OcupaÃ§Ã£o': 'Ocupação',
    'AtenÃ§Ã£o': 'Atenção',
    'NÃ£o': 'Não',
    'possÃ­vel': 'possível',
    'MÃ©todo': 'Método',
    'RelatÃ³rio': 'Relatório',
    'â€”': '---',
};

for (const [k, v] of Object.entries(replacements)) {
    content = content.split(k).join(v);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed encodings in exportUtils.ts');
