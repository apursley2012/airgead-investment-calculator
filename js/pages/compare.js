/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: compare.js Coordinates the two comparison forms, scenario         |
  |          summaries, and comparison chart on the Compare page.              |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

import { calculateCompoundInterest, money } from "../lib/calculator.js";
import { drawComparisonChart } from "../lib/charts.js";

import { renderInvestmentFields } from "../components/investment-fields.js";

renderInvestmentFields(document.querySelector('[data-investment-fields="a"]'), {
    idPrefix: "a-",
    includeNames: true,
});
renderInvestmentFields(document.querySelector('[data-investment-fields="b"]'), {
    idPrefix: "b-",
    includeNames: true,
    values: { monthlyDeposit: "500" },
});

const scenarioAForm = document.querySelector('[data-scenario="a"]');
const scenarioBForm = document.querySelector('[data-scenario="b"]');

function readScenarioInputs(form) {
    return Object.fromEntries(
        [...form.elements]
            .filter((element) => element.name)
            .map((element) => [element.name, element.value]),
    );
}

function updateComparison() {
    function calculateFinal(form) {
        try {
            const rows = calculateCompoundInterest(readScenarioInputs(form));
            return { final: rows[rows.length - 1], error: null };
        } catch (error) {
            if (!(error instanceof RangeError)) throw error;
            return { final: null, error: error.message };
        }
    }

    const scenarioA = calculateFinal(scenarioAForm);
    const scenarioB = calculateFinal(scenarioBForm);
    const scenarioAFinal = scenarioA.final;
    const scenarioBFinal = scenarioB.final;
    const errorMessage = [
        scenarioA.error && `Scenario A: ${scenarioA.error}`,
        scenarioB.error && `Scenario B: ${scenarioB.error}`,
    ]
        .filter(Boolean)
        .join(" ");
    const errorElement = document.querySelector("#compareError");
    if (errorElement instanceof HTMLElement) {
        errorElement.textContent = errorMessage;
        errorElement.hidden = !errorMessage;
    }
    const comparisonSummary = document.querySelector("#comparisonSummary");

    document.querySelector("#finalA").textContent = scenarioAFinal
        ? money(scenarioAFinal.withDeposits)
        : "Unavailable";
    document.querySelector("#finalB").textContent = scenarioBFinal
        ? money(scenarioBFinal.withDeposits)
        : "Unavailable";

    if (!scenarioAFinal || !scenarioBFinal) {
        comparisonSummary.textContent = "";
        const canvas = document.querySelector("#comparisonChart");
        if (canvas instanceof HTMLCanvasElement) {
            canvas
                .getContext("2d")
                ?.clearRect(0, 0, canvas.width, canvas.height);
        }
        return;
    }

    comparisonSummary.textContent =
        `Scenario A: principal ${money(scenarioAFinal.totalDeposits)}, ` +
        `interest earned ${money(scenarioAFinal.interestEarned)}. ` +
        `Scenario B: principal ${money(scenarioBFinal.totalDeposits)}, ` +
        `interest earned ${money(scenarioBFinal.interestEarned)}.`;

    drawComparisonChart(document.querySelector("#comparisonChart"), [
        {
            name: "Scenario A",
            balance: scenarioAFinal.withDeposits,
            interest: scenarioAFinal.interestEarned,
            principal: scenarioAFinal.totalDeposits,
        },
        {
            name: "Scenario B",
            balance: scenarioBFinal.withDeposits,
            interest: scenarioBFinal.interestEarned,
            principal: scenarioBFinal.totalDeposits,
        },
    ]);
}

[scenarioAForm, scenarioBForm].forEach((form) => {
    form.addEventListener("input", updateComparison);
    form.addEventListener("submit", (event) => event.preventDefault());
});

addEventListener("resize", updateComparison);
updateComparison();
