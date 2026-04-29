/**
 * ui.js
 * Utilitários de formatação e renderização de resultados na tela.
 *
 * Depende de: config.js  (Config.TRANSPORT_MODES deve estar carregado antes)
 *
 * Uso:
 *   UI.formatCurrency(105.5)         → "R$ 105,50"
 *   UI.formatNumber(1234.5, 1)       → "1.234,5"
 *   UI.renderResults({...})          → injeta HTML em #results-content
 *   UI.renderComparison([...])       → injeta HTML em #comparision-content
 *   UI.renderCarbonCredits({...})    → injeta HTML em #carbon-credits-content
 *   UI.showError("results", "msg")   → exibe mensagem de erro no container
 *   UI.hideAllResults()              → oculta as três seções de resultado
 */

var UI = {

  /* ── Formatadores ─────────────────────────────────────────────────── */

  formatCurrency(value) {
    return Number(value).toLocaleString("pt-BR", {
      style:                 "currency",
      currency:              "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  },

  formatNumber(value, decimals) {
    var d = (decimals !== undefined) ? decimals : 2;
    return Number(value).toLocaleString("pt-BR", {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    });
  },

  /* ── Visibilidade de seções ───────────────────────────────────────── */

  showSection(sectionId) {
    var el = document.getElementById(sectionId);
    if (el) el.classList.remove("hidden");
  },

  hideSection(sectionId) {
    var el = document.getElementById(sectionId);
    if (el) el.classList.add("hidden");
  },

  hideAllResults() {
    UI.hideSection("results");
    UI.hideSection("comparision");
    UI.hideSection("carbon-credits");
  },

  /* ── renderResults ────────────────────────────────────────────────────
   * data: {
   *   origin      {string}
   *   destination {string}
   *   distance    {number}  km
   *   emission    {number}  kg CO₂
   *   mode        {string}  chave do TRANSPORT_MODES
   *   savings     { savedKg, porcentage }  (Calculator.calculateSavings)
   * }
   * ─────────────────────────────────────────────────────────────────── */
  renderResults(data) {
    var meta  = Config.TRANSPORT_MODES[data.mode] || {};
    var icon  = meta.icon  || "🚗";
    var label = meta.label || data.mode;
    var color = meta.color || "var(--color-primary-600)";

    var emissionHTML = data.emission === 0
      ? '<span class="route-card__emission-zero">0 kg de CO₂</span>'
      : '<span class="route-card__emission-value">' + UI.formatNumber(data.emission) + '</span>'
        + '<span class="route-card__emission-unit"> kg de CO₂</span>';

    var savingsHTML = "";
    if (data.emission === 0) {
      savingsHTML = [
        '<div class="savings-badge savings-badge--zero">',
        '  <span class="savings-badge__icon">🌍</span>',
        '  <span class="savings-badge__text">',
        '    <strong>Emissão zero!</strong> Ótima escolha para o planeta.',
        '  </span>',
        '</div>',
      ].join("");
    } else if (data.savings && data.savings.savedKg > 0) {
      savingsHTML = [
        '<div class="savings-badge">',
        '  <span class="savings-badge__icon">🌿</span>',
        '  <span class="savings-badge__text">',
        '    Você economizou <strong>' + UI.formatNumber(data.savings.savedKg) + ' kg de CO₂</strong>',
        '    (' + UI.formatNumber(data.savings.porcentage, 1) + '% menos que de carro)',
        '  </span>',
        '</div>',
      ].join("");
    }

    var html = [
      '<div class="route-card" style="--mode-color:' + color + '">',
      '  <div class="route-card__mode">',
      '    <span class="route-card__mode-icon">' + icon + '</span>',
      '    <span class="route-card__mode-label">' + UI._esc(label) + '</span>',
      '  </div>',
      '  <div class="route-card__route">',
      '    <span class="route-card__city">' + UI._esc(data.origin) + '</span>',
      '    <span class="route-card__arrow">→</span>',
      '    <span class="route-card__city">' + UI._esc(data.destination) + '</span>',
      '  </div>',
      '  <div class="route-card__distance">' + UI.formatNumber(data.distance, 0) + ' km</div>',
      '  <div class="route-card__emission-row">' + emissionHTML + '</div>',
      savingsHTML,
      '</div>',
    ].join("");

    var container = document.getElementById("results-content");
    if (container) container.innerHTML = html;
    UI.showSection("results");
  },

  /* ── renderComparison ────────────────────────────────────────────────
   * modes:        Array<{ mode, emission, porcentageVsCar }>
   *               (saída de Calculator.calculateAllModes — menor emissão primeiro)
   * selectedMode: string — chave do modo escolhido pelo usuário (opcional)
   * ─────────────────────────────────────────────────────────────────── */
  renderComparison(modes, selectedMode) {
    var maxEmission = modes.reduce(function (max, m) {
      return m.emission > max ? m.emission : max;
    }, 0);

    var cardsHTML = modes.map(function (item, idx) {
      var meta   = Config.TRANSPORT_MODES[item.mode] || {};
      var icon   = meta.icon  || "";
      var label  = meta.label || item.mode;
      var color  = meta.color || "var(--color-primary-600)";
      var isBest = idx === 0;
      var isZero = item.emission === 0;
      var isSel  = item.mode === selectedMode;
      var barPct = maxEmission > 0
        ? ((item.emission / maxEmission) * 100).toFixed(1)
        : "0";

      var pctLabel = isZero
        ? "0% do carro"
        : item.mode === "car"
          ? "referência"
          : UI.formatNumber(item.porcentageVsCar, 0) + "% do carro";

      var classes = ["comparison-card"];
      if (isBest) classes.push("comparison-card--best");
      if (isSel)  classes.push("comparison-card--selected");

      var ecoBadge = isZero
        ? '<span class="comparison-card__badge comparison-card__badge--eco">🏆 Emissão zero</span>'
        : isBest
          ? '<span class="comparison-card__badge comparison-card__badge--eco">🌿 Menor emissão</span>'
          : "";

      var selBadge = isSel
        ? '<span class="comparison-card__badge comparison-card__badge--selected">✓ Selecionado</span>'
        : "";

      var badgesHTML = (ecoBadge || selBadge)
        ? '<div class="comparison-card__badges">' + ecoBadge + selBadge + '</div>'
        : "";

      return [
        '<div class="' + classes.join(" ") + '" style="--card-color:' + color + '">',
        '  <span class="comparison-card__icon">' + icon + '</span>',
        '  <span class="comparison-card__label">' + UI._esc(label) + '</span>',
        '  <div class="comparison-card__emission">',
        '    <span class="comparison-card__emission-value">' + UI.formatNumber(item.emission) + '</span>',
        '    <span class="comparison-card__emission-unit">kg de CO₂</span>',
        '  </div>',
        '  <div class="comparison-card__bar-track">',
        '    <div class="comparison-card__bar-fill" style="width:' + barPct + '%"></div>',
        '  </div>',
        '  <span class="comparison-card__pct">' + pctLabel + '</span>',
        badgesHTML,
        '</div>',
      ].join("");
    }).join("");

    var html = [
      '<h2 class="section-title">Comparação entre modos de transporte</h2>',
      '<div class="comparison-grid">' + cardsHTML + '</div>',
    ].join("");

    var container = document.getElementById("comparision-content");
    if (container) container.innerHTML = html;
    UI.showSection("comparision");
  },

  /* ── renderCarbonCredits ─────────────────────────────────────────────
   * data: {
   *   emission {number}  kg CO₂
   *   credits  {number}  (Calculator.calculateCarbonCredits)
   *   price    { min, max, average }  (Calculator.estimateCreditPrice)
   * }
   * ─────────────────────────────────────────────────────────────────── */
  renderCarbonCredits(data) {
    var html;

    if (data.emission === 0) {
      html = [
        '<h2 class="section-title">Créditos de carbono</h2>',
        '<div class="credits-card credits-card--zero">',
        '  <span class="credits-card__big-icon">🌿</span>',
        '  <p class="credits-card__message">Nenhuma emissão — nenhum crédito necessário!</p>',
        '</div>',
      ].join("");
    } else {
      var plural = data.credits !== 1 ? "s" : "";
      html = [
        '<h2 class="section-title">Créditos de carbono</h2>',
        '<div class="credits-card">',
        '  <div class="credits-card__amount">',
        '    <span class="credits-card__amount-value">' + data.credits + '</span>',
        '    <span class="credits-card__amount-label">crédito' + plural + ' de carbono</span>',
        '  </div>',
        '  <p class="credits-card__desc">',
        '    Para compensar <strong>' + UI.formatNumber(data.emission) + ' kg de CO₂</strong>',
        '    emitidos nesta viagem.',
        '  </p>',
        '  <div class="credits-card__price-row">',
        '    <div class="credits-card__price-item">',
        '      <span class="credits-card__price-label">Mín.</span>',
        '      <span class="credits-card__price-value">' + UI.formatCurrency(data.price.min) + '</span>',
        '    </div>',
        '    <div class="credits-card__price-divider">–</div>',
        '    <div class="credits-card__price-item">',
        '      <span class="credits-card__price-label">Máx.</span>',
        '      <span class="credits-card__price-value">' + UI.formatCurrency(data.price.max) + '</span>',
        '    </div>',
        '  </div>',
        '  <p class="credits-card__average">',
        '    Média estimada: <strong>' + UI.formatCurrency(data.price.average) + '</strong>',
        '  </p>',
        '</div>',
      ].join("");
    }

    var container = document.getElementById("carbon-credits-content");
    if (container) container.innerHTML = html;
    UI.showSection("carbon-credits");
  },

  /* ── showError ───────────────────────────────────────────────────────
   * Injeta uma mensagem de erro dentro de um container pelo id.
   * containerId: id do elemento pai (ex.: "results-content")
   * ─────────────────────────────────────────────────────────────────── */
  showError(containerId, message) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = [
      '<div class="message message--error">',
      '  <span class="message__icon">⚠️</span>',
      '  <span>' + UI._esc(message) + '</span>',
      '</div>',
    ].join("");
    container.classList.remove("hidden");
  },

  /* ── _esc ────────────────────────────────────────────────────────────
   * Sanitiza strings antes de inserir via innerHTML (proteção XSS).
   * ─────────────────────────────────────────────────────────────────── */
  _esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  },

};
