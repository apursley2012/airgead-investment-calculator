/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: plan-storage.js Validates and persists current calculations and   |
  |          saved plans in browser-local storage; supplies collision-         |
  |          resistant plan IDs.                                               |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

import {
    calculateCompoundInterest,
    MAX_CURRENCY,
    MAX_YEARS,
    parseNumericInput,
} from "./calculator.js";

export const SAVED_PLANS_STORAGE_KEY = "airgead_saved_plans";
const CURRENT_CALCULATION_STORAGE_KEY = "airgead_current_calc";
const INPUT_KEYS = ["startingBalance", "monthlyDeposit", "annualRate", "years"];

function isValidCalculation(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return false;
    }

    const { inputs, results } = data;
    if (
        !inputs ||
        typeof inputs !== "object" ||
        Array.isArray(inputs) ||
        !Array.isArray(results) ||
        !INPUT_KEYS.every((key) => Object.hasOwn(inputs, key))
    ) {
        return false;
    }

    let expected;
    try {
        const storedInputs = Object.fromEntries(
            INPUT_KEYS.map((key) => [key, parseNumericInput(inputs[key], key)]),
        );
        // Stored input values must describe the projection actually shown.
        // Unlike the interactive helper, stored records cannot silently clamp
        // a negative value or a year count greater than the UI permits.
        if (
            !Number.isInteger(storedInputs.years) ||
            storedInputs.years < 0 ||
            storedInputs.years > MAX_YEARS ||
            storedInputs.startingBalance < 0 ||
            storedInputs.monthlyDeposit < 0 ||
            storedInputs.annualRate < 0 ||
            storedInputs.startingBalance > MAX_CURRENCY ||
            storedInputs.monthlyDeposit > MAX_CURRENCY
        ) {
            return false;
        }

        // Stored totals are untrusted. Recalculate rather than accepting
        // structurally valid rows with altered balances or interest.
        expected = calculateCompoundInterest(inputs);
    } catch (error) {
        if (error instanceof RangeError) return false;
        throw error;
    }

    const numericFields = [
        "withDeposits",
        "withoutDeposits",
        "totalDeposits",
        "interestEarned",
        "withDepositsYearlyInterest",
        "withoutDepositsYearlyInterest",
    ];

    return (
        results.length === expected.length &&
        results.every(
            (row, index) =>
                row &&
                typeof row === "object" &&
                !Array.isArray(row) &&
                row.year === expected[index].year &&
                numericFields.every(
                    (field) =>
                        typeof row[field] === "number" &&
                        Number.isFinite(row[field]) &&
                        Object.is(row[field], expected[index][field]),
                ),
        )
    );
}

function isValidSavedPlan(plan) {
    return Boolean(
        plan &&
        typeof plan === "object" &&
        !Array.isArray(plan) &&
        typeof plan.id === "string" &&
        plan.id.length > 0 &&
        plan.id.length <= 100 &&
        typeof plan.name === "string" &&
        plan.name.trim().length > 0 &&
        plan.name.length <= 200 &&
        typeof plan.date === "string" &&
        Number.isFinite(Date.parse(plan.date)) &&
        isValidCalculation(plan.data),
    );
}

/**
 * Stores the active calculation for navigation to the results page.
 * @param {object} inputs
 * @param {Array<object>} results
 * @returns {boolean} False if data is invalid or storage rejects the write.
 */
export function saveCurrentCalculation(inputs, results) {
    if (!isValidCalculation({ inputs, results })) {
        return false;
    }

    try {
        localStorage.setItem(
            CURRENT_CALCULATION_STORAGE_KEY,
            JSON.stringify({
                inputs,
                results,
                updatedAt: new Date().toISOString(),
            }),
        );

        return true;
    } catch {
        return false;
    }
}

/**
 * Loads a structurally valid active calculation.
 * @returns {{inputs: object, results: Array<object>}|null}
 */
export function getCurrentCalculation() {
    try {
        const calculation = JSON.parse(
            localStorage.getItem(CURRENT_CALCULATION_STORAGE_KEY) || "null",
        );

        return isValidCalculation(calculation) ? calculation : null;
    } catch {
        return null;
    }
}

/**
 * Loads browser-local saved plans, omitting corrupt entries and duplicate IDs.
 * @returns {Array<object>} Valid plans, or an empty array when storage is unavailable.
 */
export function getSavedPlans() {
    try {
        const plans = JSON.parse(
            localStorage.getItem(SAVED_PLANS_STORAGE_KEY) || "[]",
        );

        // Corrupt or manually edited entries are ignored instead of reaching
        // rendering code or causing array-operation failures.
        if (!Array.isArray(plans)) {
            return [];
        }

        const seenIds = new Set();
        return plans.filter((plan) => {
            if (!isValidSavedPlan(plan) || seenIds.has(plan.id)) {
                return false;
            }
            seenIds.add(plan.id);
            return true;
        });
    } catch {
        return [];
    }
}

/**
 * Persists a complete saved-plan list.
 * @param {Array<object>} plans
 * @returns {boolean} False if records are invalid or storage rejects the write.
 */
export function setSavedPlans(plans) {
    if (!Array.isArray(plans)) return false;

    const seenIds = new Set();
    if (
        !plans.every((plan) => {
            if (!isValidSavedPlan(plan) || seenIds.has(plan.id)) {
                return false;
            }
            seenIds.add(plan.id);
            return true;
        })
    ) {
        return false;
    }

    try {
        localStorage.setItem(SAVED_PLANS_STORAGE_KEY, JSON.stringify(plans));

        return true;
    } catch {
        return false;
    }
}

/**
 * Avoids collisions when multiple saves share a millisecond timestamp.
 * @param {Array<{id: string}>} plans
 * @param {number} [timestamp=Date.now()]
 * @returns {string} A currently unused identifier.
 */
export function createSavedPlanId(plans, timestamp = Date.now()) {
    let id = timestamp;
    while (plans.some((plan) => plan.id === String(id))) {
        id += 1;
    }
    return String(id);
}
