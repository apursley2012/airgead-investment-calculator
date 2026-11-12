/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: calculator.js Calculates browser investment growth and formats    |
  |          currency values.                                                  |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

export const MAX_CURRENCY = Number.MAX_SAFE_INTEGER / 100;
export const MAX_YEARS = 80;

// Reject malformed values instead of silently treating them as zero.
export function parseNumericInput(value, field) {
    if (typeof value !== "number" && typeof value !== "string") {
        throw new RangeError(`Enter a valid ${field}.`);
    }

    if (
        typeof value === "string" &&
        !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())
    ) {
        throw new RangeError(`Enter a valid ${field}.`);
    }

    const number = Number(value);
    if (!Number.isFinite(number)) {
        throw new RangeError(`Enter a valid ${field}.`);
    }
    return number;
}

function roundCurrency(value) {
    const cents = Math.round((value + Number.EPSILON) * 100);
    if (!Number.isSafeInteger(cents)) {
        throw new RangeError(
            "Projected balances exceed the supported currency range.",
        );
    }
    return cents / 100;
}

/**
 * Projects monthly compounding with deposits credited before interest, as in C++.
 * Negative amounts and rates become zero; years are limited to 0–80.
 * @param {{startingBalance: number|string, monthlyDeposit: number|string, annualRate: number|string, years: number|string}} inputs
 *   Annual rate is a percentage (for example, 5 means 5%).
 * @returns {Array<object>} Year-zero and year-end rows. interestEarned is
 *   cumulative; withDepositsYearlyInterest and withoutDepositsYearlyInterest
 *   contain interest earned during each individual year.
 * @throws {RangeError} For malformed inputs or results outside safe currency limits.
 */
export function calculateCompoundInterest(inputs) {
    if (!inputs || typeof inputs !== "object") {
        throw new RangeError("Investment inputs are required.");
    }

    const startingBalance = Math.max(
        0,
        parseNumericInput(inputs.startingBalance, "starting balance"),
    );
    const monthlyDeposit = Math.max(
        0,
        parseNumericInput(inputs.monthlyDeposit, "monthly deposit"),
    );
    const annualRate = Math.max(
        0,
        parseNumericInput(inputs.annualRate, "annual rate"),
    );
    const inputYears = parseNumericInput(inputs.years, "number of years");

    if (!Number.isInteger(inputYears)) {
        throw new RangeError("Enter a whole number of years.");
    }

    const years = Math.min(MAX_YEARS, Math.max(0, inputYears));
    const monthlyRate = annualRate / 100 / 12;

    let withDeposits = startingBalance;
    let withoutDeposits = startingBalance;
    let totalDeposits = startingBalance;

    const rows = [
        {
            year: 0,
            withDeposits: roundCurrency(withDeposits),
            withoutDeposits: roundCurrency(withoutDeposits),
            totalDeposits: roundCurrency(totalDeposits),
            interestEarned: 0,
            withDepositsYearlyInterest: 0,
            withoutDepositsYearlyInterest: 0,
        },
    ];

    for (let year = 1; year <= years; year += 1) {
        let withDepositsYearlyInterest = 0;
        let withoutDepositsYearlyInterest = 0;

        for (let month = 0; month < 12; month += 1) {
            // Contributions accrue interest in the same month they are made.
            withDeposits += monthlyDeposit;

            const withDepositsMonthlyInterest = withDeposits * monthlyRate;
            const withoutDepositsMonthlyInterest =
                withoutDeposits * monthlyRate;

            withDeposits += withDepositsMonthlyInterest;
            withoutDeposits += withoutDepositsMonthlyInterest;
            totalDeposits += monthlyDeposit;

            withDepositsYearlyInterest += withDepositsMonthlyInterest;
            withoutDepositsYearlyInterest += withoutDepositsMonthlyInterest;
        }

        if (
            ![
                withDeposits,
                withoutDeposits,
                totalDeposits,
                withDepositsYearlyInterest,
                withoutDepositsYearlyInterest,
            ].every(Number.isFinite)
        ) {
            throw new RangeError(
                "Projected balances exceed the supported numeric range.",
            );
        }

        rows.push({
            year,
            withDeposits: roundCurrency(withDeposits),
            withoutDeposits: roundCurrency(withoutDeposits),
            totalDeposits: roundCurrency(totalDeposits),
            interestEarned: roundCurrency(withDeposits - totalDeposits),
            withDepositsYearlyInterest: roundCurrency(
                withDepositsYearlyInterest,
            ),
            withoutDepositsYearlyInterest: roundCurrency(
                withoutDepositsYearlyInterest,
            ),
        });
    }

    return rows;
}

/**
 * Formats a value as currency with two decimal places.
 * @param {number|string} value
 * @returns {string}
 */
export const money = (value) =>
    "$" +
    (Number(value) || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
