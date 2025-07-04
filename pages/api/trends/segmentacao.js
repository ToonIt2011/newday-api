// /trends/segmentacao.js

// Função para segmentar o público com base no nicho
export const segmentarPorNicho = (nicho, dados) => {
  switch (nicho) {
    case 'DJ Bolivar':
      return segmentarDJBolivar(dados);
    case 'Música Eletrônica':
      return segmentarMusicaEletronica(dados);
    case 'Esportes':
      return segmentarEsportes(dados);
    case 'Tecnologia':
      return segmentarTecnologia(dados);
    case 'Viagens':
      return segmentarViagens(dados);
    default:
      return [];
  }
};

// Exemplo de segmentação para DJ Bolivar
const segmentarDJBolivar = (dados) => {
  // Lógica para segmentar o público que gosta de DJ Bolivar, pode ser baseado em dados de rede social, por exemplo
  return dados.filter(pessoa => pessoa.interesse.includes('DJ Bolivar'));
};

// Exemplo de segmentação para Música Eletrônica
const segmentarMusicaEletronica = (dados) => {
  return dados.filter(pessoa => pessoa.interesse.includes('Música Eletrônica'));
};

// Exemplo de segmentação para Esportes
const segmentarEsportes = (dados) => {
  return dados.filter(pessoa => pessoa.interesse.includes('Esportes'));
};

// Exemplo de segmentação para Tecnologia
const segmentarTecnologia = (dados) => {
  return dados.filter(pessoa => pessoa.interesse.includes('Tecnologia'));
};

// Exemplo de segmentação para Viagens
const segmentarViagens = (dados) => {
  return dados.filter(pessoa => pessoa.interesse.includes('Viagens'));
};
