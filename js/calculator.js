/**
 * calculator.js
 * Lógica de cálculo de emissões de CO2, comparações entre modos e créditos de carbono.
 *
 * Depende de: config.js  (Config deve estar carregado antes)
 *
 * Uso:
 *   Calculator.calculateEmission(500, "car")        → 105
 *   Calculator.calculateAllModes(500)               → [{mode, emission, porcentageVsCar}, ...]
 *   Calculator.calculateSavings(44.5, 105)          → {savedKg, porcentage}
 *   Calculator.calculateCarbonCredits(105)          → 0.105
 *   Calculator.estimateCreditPrice(0.105)           → {min, max, average}
 */

var Calculator = {

  /* ─────────────────────────────────────────────────────────────────────
   * calculateEmission(distanceKm, transportMode)
   * Multiplica a distância pelo fator de emissão do modo escolhido.
   *
   * @param  {number} distanceKm    Distância em km
   * @param  {string} transportMode Chave do modo: "bicycle" | "car" | "bus" | "truck"
   * @returns {number}              kg de CO2, arredondado a 2 casas decimais
   * ──────────────────────────────────────────────────────────────────── */
  calculateEmission(distanceKm, transportMode) {
    var factor = Config.EMISSION_FACTORS[transportMode];

    if (factor === undefined) {
      console.warn("Calculator.calculateEmission: modo desconhecido →", transportMode);
      return 0;
    }

    return parseFloat((distanceKm * factor).toFixed(2));
  },

  /* ─────────────────────────────────────────────────────────────────────
   * calculateAllModes(distanceKm)
   * Calcula a emissão para todos os modos e a porcentagem relativa ao carro.
   * Retorna os resultados ordenados do menor para o maior (mais limpo primeiro).
   *
   * @param  {number} distanceKm
   * @returns {Array<{mode: string, emission: number, porcentageVsCar: number}>}
   * ──────────────────────────────────────────────────────────────────── */
  calculateAllModes(distanceKm) {
    var results     = [];
    var carEmission = this.calculateEmission(distanceKm, "car");

    Object.keys(Config.EMISSION_FACTORS).forEach(function (mode) {
      var emission = Calculator.calculateEmission(distanceKm, mode);

      /* Evita divisão por zero caso a emissão do carro seja 0 */
      var porcentageVsCar = carEmission > 0
        ? parseFloat(((emission / carEmission) * 100).toFixed(2))
        : 0;

      results.push({
        mode:            mode,
        emission:        emission,
        porcentageVsCar: porcentageVsCar,
      });
    });

    /* Menor emissão primeiro */
    results.sort(function (a, b) {
      return a.emission - b.emission;
    });

    return results;
  },

  /* ─────────────────────────────────────────────────────────────────────
   * calculateSavings(emission, baselineEmission)
   * Calcula quanto CO2 é economizado em relação à linha de base (normalmente o carro).
   *
   * @param  {number} emission         kg de CO2 do modo escolhido
   * @param  {number} baselineEmission kg de CO2 do modo de referência
   * @returns {{ savedKg: number, porcentage: number }}
   * ──────────────────────────────────────────────────────────────────── */
  calculateSavings(emission, baselineEmission) {
    /* Não calcula economia quando a referência é zero (ex.: bicicleta vs bicicleta) */
    if (baselineEmission <= 0) {
      return { savedKg: 0, porcentage: 0 };
    }

    var savedKg    = baselineEmission - emission;
    var porcentage = (savedKg / baselineEmission) * 100;

    return {
      savedKg:    parseFloat(savedKg.toFixed(2)),
      porcentage: parseFloat(porcentage.toFixed(2)),
    };
  },

  /* ─────────────────────────────────────────────────────────────────────
   * calculateCarbonCredits(emissionKg)
   * Converte kg de CO2 em créditos de carbono com base em Config.CARBON_CREDIT.
   *
   * @param  {number} emissionKg Total de CO2 emitido em kg
   * @returns {number}           Créditos necessários, arredondado a 4 casas decimais
   * ──────────────────────────────────────────────────────────────────── */
  calculateCarbonCredits(emissionKg) {
    var credits = emissionKg / Config.CARBON_CREDIT.KG_PER_CREDIT;
    return parseFloat(credits.toFixed(4));
  },

  /* ─────────────────────────────────────────────────────────────────────
   * estimateCreditPrice(credits)
   * Estima o custo de compensação em R$ usando os preços mínimo e máximo
   * definidos em Config.CARBON_CREDIT.
   *
   * @param  {number} credits Quantidade de créditos de carbono
   * @returns {{ min: number, max: number, average: number }} Valores em BRL
   * ──────────────────────────────────────────────────────────────────── */
  estimateCreditPrice(credits) {
    var min     = credits * Config.CARBON_CREDIT.PRICE_MIN_BRL;
    var max     = credits * Config.CARBON_CREDIT.PRICE_MAX_BRL;
    var average = (min + max) / 2;

    return {
      min:     parseFloat(min.toFixed(2)),
      max:     parseFloat(max.toFixed(2)),
      average: parseFloat(average.toFixed(2)),
    };
  },

};
