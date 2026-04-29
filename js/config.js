/**
 * config.js
 * Configurações globais da calculadora de CO2.
 *
 * Depende de: routes-data.js (RoutesDB deve estar carregado antes)
 *
 * Uso:
 *   Config.EMISSION_FACTORS.car          → 0.12
 *   Config.TRANSPORT_MODES.car.label     → "Carro"
 *   Config.CARBON_CREDIT.KG_PER_CREDIT   → 100
 *   Config.populateDatalist()            → preenche o datalist de cidades
 *   Config.setupDistanceAutoFill()       → ativa o preenchimento automático
 */

var Config = {
  /* ── Fatores de emissão ───────────────────────────────────────────────
   * Unidade: kg de CO2 por km percorrido por passageiro/veículo.
   * Fontes de referência: IPCC, ANTT, CETESB.
   * ─────────────────────────────────────────────────────────────────── */
  EMISSION_FACTORS: {
    bicycle: 0, // emissão zero
    car: 0.12, // média frota brasileira (gasolina + etanol)
    bus: 0.089, // ônibus urbano/rodoviário — divisão por passageiro
    truck: 0.96, // caminhão médio carregado
  },

  /* ── Metadados dos modos de transporte ────────────────────────────────
   * Usados pela UI para renderizar cards, legendas e gráficos.
   * ─────────────────────────────────────────────────────────────────── */
  TRANSPORT_MODES: {
    bicycle: {
      label: "Bicicleta",
      icon: "🚲",
      color: "#16a34a", // verde — emissão zero
    },
    car: {
      label: "Carro",
      icon: "🚗",
      color: "#ef4444", // vermelho — maior emissão individual
    },
    bus: {
      label: "Ônibus",
      icon: "🚌",
      color: "#f59e0b", // âmbar — emissão média
    },
    truck: {
      label: "Caminhão",
      icon: "🚚",
      color: "#7c3aed", // roxo — maior emissão total
    },
  },

  /* ── Créditos de carbono ──────────────────────────────────────────────
   * KG_PER_CREDIT : quantidade de CO2 (kg) compensada por 1 crédito
   * PRICE_MIN_BRL : preço mínimo de mercado (R$) por crédito
   * PRICE_MAX_BRL : preço máximo de mercado (R$) por crédito
   * ─────────────────────────────────────────────────────────────────── */
  CARBON_CREDIT: {
    KG_PER_CREDIT: 100,
    PRICE_MIN_BRL: 50,
    PRICE_MAX_BRL: 160,
  },

  /* ────────────────────────────────────────────────────────────────────
   * populateDatalist()
   * Lê todas as cidades do RoutesDB e insere como <option> no datalist
   * compartilhado pelos campos origem e destino.
   * ─────────────────────────────────────────────────────────────────── */
  populateDatalist() {
    var datalist = document.getElementById("cities-list");
    if (!datalist) return;

    var cities = RoutesDB.getAllCities();

    cities.forEach(function (city) {
      var option = document.createElement("option");
      option.value = city;
      datalist.appendChild(option);
    });
  },

  /* ────────────────────────────────────────────────────────────────────
   * setupDistanceAutoFill()
   * Monitora os campos de origem e destino. Quando ambos estiverem
   * preenchidos, tenta encontrar a distância em RoutesDB e preenche
   * o campo automaticamente (readonly). Se não encontrar, sugere
   * entrada manual. O checkbox #manual-distance libera edição direta.
   * ─────────────────────────────────────────────────────────────────── */
  setupDistanceAutoFill() {
    var originInput = document.getElementById("origin");
    var destinationInput = document.getElementById("destination");
    var distanceInput = document.getElementById("distance");
    var manualCheckbox = document.getElementById("manual-distance");

    if (
      !originInput ||
      !destinationInput ||
      !distanceInput ||
      !manualCheckbox
    ) {
      console.warn(
        "Config.setupDistanceAutoFill: um ou mais elementos não encontrados.",
      );
      return;
    }

    /* Cria elemento de feedback inserido após o helper text */
    var statusEl = document.createElement("span");
    statusEl.id = "distance-status";
    statusEl.className = "form__helper";
    distanceInput.parentNode.appendChild(statusEl);

    /* ── Helpers internos ─────────────────────────────────────────── */

    function setReadonly(isReadonly) {
      if (isReadonly) {
        distanceInput.setAttribute("readonly", "");
        distanceInput.classList.add("form__input--readonly");
        distanceInput.classList.remove("form__input--editable");
      } else {
        distanceInput.removeAttribute("readonly");
        distanceInput.classList.remove("form__input--readonly");
        distanceInput.classList.add("form__input--editable");
      }
    }

    function showStatus(message, type) {
      /* type: "success" | "warning" | "error" */
      var colorMap = {
        success: "var(--color-success-dark, #15803d)",
        warning: "var(--color-warning-dark, #b45309)",
        error: "var(--color-error-dark,   #b91c1c)",
      };
      statusEl.textContent = message;
      statusEl.style.color = colorMap[type] || colorMap.warning;
      statusEl.style.display = "block";
    }

    function clearStatus() {
      statusEl.textContent = "";
      statusEl.style.display = "none";
    }

    /* ── Lógica principal de preenchimento ────────────────────────── */

    function tryAutoFill() {
      /* No modo manual, não interfere no campo */
      if (manualCheckbox.checked) return;

      var origin = originInput.value.trim();
      var destination = destinationInput.value.trim();

      /* Aguarda ambos os campos terem valor */
      if (!origin || !destination) {
        clearStatus();
        return;
      }

      var distance = RoutesDB.findDistance(origin, destination);

      if (distance !== null) {
        distanceInput.value = distance;
        setReadonly(true);
        showStatus(
          "✓ Distância preenchida automaticamente (" + distance + " km)",
          "success",
        );
      } else {
        distanceInput.value = "";
        setReadonly(false);
        showStatus(
          'Rota não encontrada. Marque "inserir distância manualmente" para digitar.',
          "warning",
        );
      }
    }

    /* ── Event listeners ─────────────────────────────────────────── */

    /* change dispara ao sair do campo; input dispara a cada keystroke/seleção
       no datalist — usamos ambos para cobrir os dois cenários             */
    originInput.addEventListener("change", tryAutoFill);
    destinationInput.addEventListener("change", tryAutoFill);
    originInput.addEventListener("input", tryAutoFill);
    destinationInput.addEventListener("input", tryAutoFill);

    manualCheckbox.addEventListener("change", function () {
      if (manualCheckbox.checked) {
        /* Modo manual: libera o campo e foca para o usuário digitar */
        setReadonly(false);
        distanceInput.value = "";
        showStatus("Insira a distância em km manualmente.", "warning");
        distanceInput.focus();
      } else {
        /* Voltou ao modo automático: tenta preencher novamente */
        tryAutoFill();
        if (!distanceInput.value) {
          clearStatus();
        }
      }
    });
  },
};
