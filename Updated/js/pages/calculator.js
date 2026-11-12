/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: calculator.js Connects calculator-page controls to the shared     |
  |          calculation module, live projection display, and Results          |
  |          navigation.                                                       |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

import { calculateCompoundInterest, money } from "../lib/calculator.js";
import { saveCurrentCalculation } from "../lib/plan-storage.js";

import { renderInvestmentFields } from "../components/investment-fields.js";

renderInvestmentFields(document.querySelector("[data-investment-fields]"));

const form = document.querySelector("#calculatorForm");
const inputIds = ["startingBalance", "monthlyDeposit", "annualRate", "years"];
const display = document.querySelector("#displayWith");

let lastDisplayedValue = 0;
let animationFrameId = null;

function getInputs() {
    const values = inputIds.map((id) => {
        const input = document.getElementById(id);
        if (!(input instanceof HTMLInputElement)) {
            throw new Error(`Missing calculator input: ${id}`);
        }
        return input.value;
    });

    const [startingBalance, monthlyDeposit, annualRate, years] = values;
    return { startingBalance, monthlyDeposit, annualRate, years };
}

function animateTo(target) {
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
    }

    if (reduceMotion) {
        display.textContent = money(target);
        lastDisplayedValue = target;
        animationFrameId = null;
        return;
    }

    const start = lastDisplayedValue;
    const begin = performance.now();
    const duration = 650;

    function step(now) {
        const progress = Math.min((now - begin) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        display.textContent = money(start + (target - start) * ease);

        if (progress < 1) {
            animationFrameId = requestAnimationFrame(step);
        } else {
            lastDisplayedValue = target;
            animationFrameId = null;
        }
    }

    animationFrameId = requestAnimationFrame(step);
}

function updatePreview() {
    let results;

    try {
        results = calculateCompoundInterest(getInputs());
    } catch (error) {
        if (!(error instanceof RangeError)) throw error;

        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        display.textContent = "Unavailable";
        document.querySelector("#withoutDeposits").textContent = "Unavailable";
        document.querySelector("#difference").textContent = "Unavailable";
        document.querySelector("#noticeText").textContent = error.message;
        return null;
    }

    const final = results[results.length - 1];
    const difference = final.withDeposits - final.withoutDeposits;

    animateTo(final.withDeposits);

    document.querySelector("#withoutDeposits").textContent = money(
        final.withoutDeposits,
    );
    document.querySelector("#difference").textContent = "+" + money(difference);
    document.querySelector("#noticeText").textContent =
        `You earn ${money(difference)} more by contributing monthly.`;

    return results;
}

inputIds.forEach((id) => {
    document.getElementById(id).addEventListener("input", updatePreview);
});

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const inputs = getInputs();
    let results;

    try {
        results = calculateCompoundInterest(inputs);
    } catch (error) {
        if (!(error instanceof RangeError)) throw error;

        window.alert(error.message);
        return;
    }

    const calculationSaved = saveCurrentCalculation(inputs, results);

    if (!calculationSaved) {
        window.alert(
            "The calculation could not be saved in this browser. " +
                "Check browser storage settings and try again.",
        );
        return;
    }

    location.href = "results.html";
});

updatePreview();
