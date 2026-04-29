/**
 * app.js
 * Ponto de entrada da aplicação.
 * Registra todos os event listeners e orquestra Config → Calculator → UI.
 *
 * Depende de (nesta ordem): routes-data.js, config.js, calculator.js, ui.js
 */

(function () {
  "use strict";

  /* ── Referências ao DOM ──────────────────────────────────────────── */
  var form          = document.getElementById("calculator-form");
  var originInput   = document.getElementById("origin");
  var destInput     = document.getElementById("destination");
  var distanceInput = document.getElementById("distance");
  var submitBtn     = form.querySelector(".form__submit");

  /* ── Inicialização ───────────────────────────────────────────────── */
  function init() {
    Config.populateDatalist();
    Config.setupDistanceAutoFill();

    form.addEventListener("submit", handleSubmit);

    /* Limpa o erro inline quando o usuário começa a corrigir o campo */
    [originInput, destInput, distanceInput].forEach(function (input) {
      input.addEventListener("input", function () { clearFieldError(input); });
    });
  }

  /* ── Submit ──────────────────────────────────────────────────────── */
  function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) return;

    var origin      = originInput.value.trim();
    var destination = destInput.value.trim();
    var distance    = parseFloat(distanceInput.value);
    var mode        = getSelectedMode();

    setLoading(true);

    var emission    = Calculator.calculateEmission(distance, mode);
    var carEmission = Calculator.calculateEmission(distance, "car");
    var savings     = Calculator.calculateSavings(emission, carEmission);
    var allModes    = Calculator.calculateAllModes(distance);
    var credits     = Calculator.calculateCarbonCredits(emission);
    var price       = Calculator.estimateCreditPrice(credits);

    UI.renderResults({
      origin:      origin,
      destination: destination,
      distance:    distance,
      emission:    emission,
      mode:        mode,
      savings:     savings,
    });

    UI.renderComparison(allModes, mode);

    UI.renderCarbonCredits({
      emission: emission,
      credits:  credits,
      price:    price,
    });

    setLoading(false);
    scrollToResults();
  }

  /* ── Validação ───────────────────────────────────────────────────── */
  function validate() {
    var ok     = true;
    var origin = originInput.value.trim();
    var dest   = destInput.value.trim();
    var dist   = distanceInput.value;

    if (!origin) {
      setFieldError(originInput, "Informe a cidade de origem.");
      ok = false;
    }

    if (!dest) {
      setFieldError(destInput, "Informe a cidade de destino.");
      ok = false;
    } else if (dest.toLowerCase() === origin.toLowerCase()) {
      setFieldError(destInput, "Origem e destino não podem ser iguais.");
      ok = false;
    }

    if (!dist || parseFloat(dist) <= 0) {
      setFieldError(distanceInput, "Informe uma distância válida maior que zero.");
      ok = false;
    }

    return ok;
  }

  /* ── Erros inline nos campos ─────────────────────────────────────── */
  function setFieldError(input, message) {
    input.classList.add("form__input--error");

    var existing = input.parentNode.querySelector(".form__error-text");
    if (existing) {
      existing.textContent = message;
      return;
    }

    var el       = document.createElement("span");
    el.className   = "form__error-text";
    el.textContent = message;
    input.parentNode.appendChild(el);
  }

  function clearFieldError(input) {
    input.classList.remove("form__input--error");
    var el = input.parentNode.querySelector(".form__error-text");
    if (el) el.remove();
  }

  /* ── Estado de carregamento no botão ─────────────────────────────── */
  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.innerHTML = isLoading
      ? '<span class="spinner"></span> Calculando…'
      : "Calcular emissão";
  }

  /* ── Utilitários ─────────────────────────────────────────────────── */
  function getSelectedMode() {
    var checked = form.querySelector('input[name="transport"]:checked');
    return checked ? checked.value : "car";
  }

  function scrollToResults() {
    var el = document.getElementById("results");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ── Arranque ────────────────────────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", init);

})();
