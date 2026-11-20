// Preços em centavos. A prévia e o Checkout usam este mesmo catálogo.
globalThis.catalogoOrcamentoFacil = (() => {
  const PRECOS = Object.freeze({ base: 490, logo: 19, modeloComAcrescimo: 49 });

  const MODELOS = Object.freeze([
    { id: "original", nome: "Original", acrescimo: 0 },
    { id: "centralizado", nome: "Centralizado", acrescimo: 0 },
    { id: "grade", nome: "Grade de células", acrescimo: 0 },
    { id: "alternado", nome: "Linhas alternadas", acrescimo: 0 },
    { id: "faixa", nome: "Faixa no título", acrescimo: PRECOS.modeloComAcrescimo },
    { id: "ficha", nome: "Ficha em dois blocos", acrescimo: PRECOS.modeloComAcrescimo },
    { id: "lateral", nome: "Coluna lateral", acrescimo: PRECOS.modeloComAcrescimo },
  ]);

  function precoOrcamento(modelo, temLogo) {
    return PRECOS.base + (temLogo ? PRECOS.logo : 0) + modelo.acrescimo;
  }

  return Object.freeze({ MODELOS, PRECOS, precoOrcamento });
})();
