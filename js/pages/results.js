/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: results.js Renders the current calculation, chart, table, saved-  |
  |          plan action, and CSV export on the Results page.                  |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

import { money } from "../lib/calculator.js";
import {
    createSavedPlanId,
    getCurrentCalculation,
    getSavedPlans,
    setSavedPlans,
} from "../lib/plan-storage.js";
import { downloadCsv } from "../lib/csv-export.js";
import { drawGrowthChart } from "../lib/charts.js";
import { toast } from "../components/toast.js";
import { renderReportTables } from "../components/report-table.js";

renderReportTables();

function initializeResultsPage() {
    const data = getCurrentCalculation();

    if (!data) {
        location.replace("calculator.html");
        return;
    }

    const { inputs, results } = data;
    const final = results[results.length - 1];

    document.querySelector("#finalWith").textContent = money(
        final.withDeposits,
    );
    document.querySelector("#totalPrincipal").textContent = money(
        final.totalDeposits,
    );
    document.querySelector("#totalInterest").textContent = money(
        final.interestEarned,
    );
    document.querySelector("#finalWithout").textContent = money(
        final.withoutDeposits,
    );
    document.querySelector("#withoutText").textContent =
        `Just leaving the initial ${money(inputs.startingBalance)} to grow.`;

    const yearlyResults = results.filter((row) => row.year > 0);

    function renderReportRows(tableBody, balanceKey, interestKey) {
        const rows = yearlyResults.map((row) => {
            const tableRow = document.createElement("tr");
            const yearCell = document.createElement("th");
            yearCell.scope = "row";
            const balanceCell = document.createElement("td");
            const balance = document.createElement("strong");
            const interestCell = document.createElement("td");

            yearCell.textContent = row.year;
            balance.textContent = money(row[balanceKey]);
            balanceCell.appendChild(balance);

            interestCell.className = "positive";
            interestCell.textContent = money(row[interestKey]);

            tableRow.append(yearCell, balanceCell, interestCell);

            return tableRow;
        });

        tableBody.replaceChildren(...rows);
    }

    renderReportRows(
        document.querySelector("#withoutDepositsReport"),
        "withoutDeposits",
        "withoutDepositsYearlyInterest",
    );
    renderReportRows(
        document.querySelector("#withDepositsReport"),
        "withDeposits",
        "withDepositsYearlyInterest",
    );

    function redrawGrowthChart() {
        drawGrowthChart(document.querySelector("#growthChart"), results);
    }

    redrawGrowthChart();
    addEventListener("resize", redrawGrowthChart);

    document.querySelector("#savePlan").addEventListener("click", () => {
        const plans = getSavedPlans();

        plans.push({
            id: createSavedPlanId(plans),
            date: new Date().toISOString(),
            name:
                `Plan: ${money(inputs.monthlyDeposit)}/mo ` +
                `for ${inputs.years} years`,
            data,
        });

        if (setSavedPlans(plans)) {
            toast("Plan saved locally");
        } else {
            toast("Unable to save plan: browser storage is unavailable");
        }
    });

    document.querySelector("#exportCsv").addEventListener("click", () => {
        try {
            downloadCsv(`airgead-${inputs.years}-year-plan.csv`, [
                [
                    "Year",
                    "Balance Without Monthly Deposits",
                    "Interest Earned Without Monthly Deposits",
                    "Balance With Monthly Deposits",
                    "Interest Earned With Monthly Deposits",
                    "Total Principal",
                    "Total Interest With Monthly Deposits",
                ],
                ...yearlyResults.map((row) => [
                    row.year,
                    row.withoutDeposits,
                    row.withoutDepositsYearlyInterest,
                    row.withDeposits,
                    row.withDepositsYearlyInterest,
                    row.totalDeposits,
                    row.interestEarned,
                ]),
            ]);
            toast("CSV exported");
        } catch {
            toast("Unable to export CSV in this browser");
        }
    });
}

initializeResultsPage();
