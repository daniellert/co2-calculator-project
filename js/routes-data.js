/**
 * routes-data.js
 * Base de dados estática de rotas brasileiras com distâncias rodoviárias reais.
 *
 * Estrutura de cada rota:
 *   { origin: string, destination: string, distanceKm: number }
 *
 * Uso:
 *   RoutesDB.getAllCities()         → array de cidades únicas ordenadas
 *   RoutesDB.findDistance(a, b)    → number (km) ou null
 */

var RoutesDB = {

  /**
   * Array de rotas.
   * Cada par aparece uma única vez — findDistance busca nas duas direções.
   */
  routes: [

    /* ── Sudeste: capitais e principais cidades ─────────────────────── */
    { origin: "São Paulo, SP",        destination: "Rio de Janeiro, RJ",   distanceKm: 430  },
    { origin: "São Paulo, SP",        destination: "Brasília, DF",         distanceKm: 1015 },
    { origin: "São Paulo, SP",        destination: "Belo Horizonte, MG",   distanceKm: 586  },
    { origin: "São Paulo, SP",        destination: "Curitiba, PR",         distanceKm: 408  },
    { origin: "São Paulo, SP",        destination: "Salvador, BA",         distanceKm: 1960 },
    { origin: "São Paulo, SP",        destination: "Campinas, SP",         distanceKm: 99   },
    { origin: "São Paulo, SP",        destination: "Ribeirão Preto, SP",   distanceKm: 313  },
    { origin: "São Paulo, SP",        destination: "Santos, SP",           distanceKm: 72   },
    { origin: "Rio de Janeiro, RJ",   destination: "Brasília, DF",         distanceKm: 1150 },
    { origin: "Rio de Janeiro, RJ",   destination: "Belo Horizonte, MG",   distanceKm: 434  },
    { origin: "Rio de Janeiro, RJ",   destination: "Vitória, ES",          distanceKm: 521  },
    { origin: "Belo Horizonte, MG",   destination: "Brasília, DF",         distanceKm: 716  },
    { origin: "Belo Horizonte, MG",   destination: "Vitória, ES",          distanceKm: 524  },
    { origin: "Belo Horizonte, MG",   destination: "Uberlândia, MG",       distanceKm: 557  },
    { origin: "Vitória, ES",          destination: "Salvador, BA",         distanceKm: 1020 },

    /* ── Centro-Oeste ────────────────────────────────────────────────── */
    { origin: "Brasília, DF",         destination: "Goiânia, GO",          distanceKm: 209  },
    { origin: "Brasília, DF",         destination: "Campo Grande, MS",     distanceKm: 1134 },
    { origin: "Brasília, DF",         destination: "Belém, PA",            distanceKm: 2120 },
    { origin: "Goiânia, GO",          destination: "Campo Grande, MS",     distanceKm: 935  },
    { origin: "Campo Grande, MS",     destination: "Cuiabá, MT",           distanceKm: 694  },
    { origin: "Cuiabá, MT",           destination: "Porto Velho, RO",      distanceKm: 1460 },

    /* ── Sul ─────────────────────────────────────────────────────────── */
    { origin: "Curitiba, PR",         destination: "Florianópolis, SC",    distanceKm: 300  },
    { origin: "Curitiba, PR",         destination: "Porto Alegre, RS",     distanceKm: 716  },
    { origin: "Florianópolis, SC",    destination: "Porto Alegre, RS",     distanceKm: 476  },
    { origin: "Porto Alegre, RS",     destination: "Caxias do Sul, RS",    distanceKm: 122  },

    /* ── Nordeste ────────────────────────────────────────────────────── */
    { origin: "Salvador, BA",         destination: "Recife, PE",           distanceKm: 839  },
    { origin: "Salvador, BA",         destination: "Aracaju, SE",          distanceKm: 356  },
    { origin: "Aracaju, SE",          destination: "Maceió, AL",           distanceKm: 294  },
    { origin: "Maceió, AL",           destination: "Recife, PE",           distanceKm: 285  },
    { origin: "Recife, PE",           destination: "João Pessoa, PB",      distanceKm: 120  },
    { origin: "Recife, PE",           destination: "Fortaleza, CE",        distanceKm: 800  },
    { origin: "João Pessoa, PB",      destination: "Natal, RN",            distanceKm: 185  },
    { origin: "Natal, RN",            destination: "Fortaleza, CE",        distanceKm: 537  },
    { origin: "Fortaleza, CE",        destination: "Teresina, PI",         distanceKm: 630  },
    { origin: "Teresina, PI",         destination: "São Luís, MA",         distanceKm: 446  },
    { origin: "São Luís, MA",         destination: "Belém, PA",            distanceKm: 870  },
    { origin: "São Luís, MA",         destination: "Fortaleza, CE",        distanceKm: 1070 },

    /* ── Norte ───────────────────────────────────────────────────────── */
    { origin: "Belém, PA",            destination: "Manaus, AM",           distanceKm: 2700 },
    { origin: "Manaus, AM",           destination: "Porto Velho, RO",      distanceKm: 903  },
    { origin: "Porto Velho, RO",      destination: "Rio Branco, AC",       distanceKm: 540  },

  ],

  /**
   * Retorna um array com todos os nomes de cidades únicos, em ordem alfabética.
   * Extrai tanto o campo origin quanto o destination de cada rota.
   */
  getAllCities() {
    const citySet = new Set();

    this.routes.forEach(function (route) {
      citySet.add(route.origin);
      citySet.add(route.destination);
    });

    return Array.from(citySet).sort(function (a, b) {
      return a.localeCompare(b, "pt-BR");
    });
  },

  /**
   * Busca a distância em km entre duas cidades.
   * A busca é bidirecional (origem→destino ou destino→origem).
   * Ignora espaços extras e diferenças de maiúsculas/minúsculas.
   *
   * @param {string} origin      - Nome da cidade de origem
   * @param {string} destination - Nome da cidade de destino
   * @returns {number|null} Distância em km, ou null se a rota não for encontrada
   */
  findDistance(origin, destination) {
    const normalize = (str) => str.trim().toLowerCase();

    const normOrigin      = normalize(origin);
    const normDestination = normalize(destination);

    const match = this.routes.find(function (route) {
      const rOrigin = normalize(route.origin);
      const rDest   = normalize(route.destination);

      return (
        (rOrigin === normOrigin && rDest === normDestination) ||
        (rOrigin === normDestination && rDest === normOrigin)
      );
    });

    return match ? match.distanceKm : null;
  },

};
