# Calculadora de Emissão de CO2

Ferramenta web que calcula as emissões de CO2 geradas por uma viagem entre cidades brasileiras, considerando o meio de transporte utilizado. Desenvolvida para a DIO como projeto do GitHub Copilot.

## Acesso

**[https://daniellert.github.io/co2-calculator-project/](https://daniellert.github.io/co2-calculator-project/)**

## O que faz

- Seleciona cidade de **origem** e **destino** com autocompletar
- Preenche a **distância automaticamente** com base em rotas cadastradas, ou permite inserção manual
- Suporta 4 meios de transporte: 🚲 Bicicleta, 🚗 Carro, 🚌 Ônibus e 🚚 Caminhão
- Exibe o total de **kg de CO2 emitido** na viagem
- Compara as emissões entre todos os modos de transporte
- Calcula quantos **créditos de carbono** seriam necessários para compensar a emissão e estima o custo em R$

## Fatores de emissão utilizados

| Transporte | kg CO2 / km |
|-----------|------------|
| Bicicleta | 0 |
| Ônibus    | 0,089 |
| Carro     | 0,12 |
| Caminhão  | 0,96 |

Fontes de referência: IPCC, ANTT e CETESB.

## Tecnologias

- HTML5, CSS3 e JavaScript puro (sem dependências externas)
- Deploy via GitHub Pages
