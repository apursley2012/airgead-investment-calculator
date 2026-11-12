/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: saved-plans.js Renders validated browser-local saved plans and    |
  |          handles reopen/delete actions without interpreting stored text as |
  |          HTML.                                                             |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

import {
    getSavedPlans,
    SAVED_PLANS_STORAGE_KEY,
    saveCurrentCalculation,
    setSavedPlans,
} from "../lib/plan-storage.js";
import { toast } from "../components/toast.js";
import { createPlanCard } from "../components/plan-card.js";

const plansContainer = document.querySelector("#plans");

function openPlan(plan) {
    const { inputs, results } = plan.data;

    if (!saveCurrentCalculation(inputs, results)) {
        toast("Unable to open plan: browser storage is unavailable");
        return;
    }

    location.href = "results.html";
}

function deletePlan(planId) {
    if (!window.confirm("Delete this saved plan? This cannot be undone.")) {
        return;
    }

    const plans = getSavedPlans();
    if (!plans.some((plan) => plan.id === planId)) {
        renderPlans();
        toast("That plan no longer exists");
        return;
    }

    const remainingPlans = plans.filter((plan) => plan.id !== planId);
    if (!setSavedPlans(remainingPlans)) {
        toast("Unable to remove plan: browser storage is unavailable");
        return;
    }

    renderPlans();
    toast("Plan removed");
}

function renderPlans() {
    const plans = getSavedPlans();

    plansContainer.replaceChildren();

    if (!plans.length) {
        const emptyState = document.createElement("article");
        const heading = document.createElement("h2");
        const message = document.createElement("p");
        const link = document.createElement("a");

        emptyState.className = "card empty";
        heading.textContent = "No saved plans yet.";
        message.textContent =
            "Run a calculation, open its results, and choose Save Plan.";
        link.className = "btn btn-primary";
        link.href = "calculator.html";
        link.textContent = "Open Calculator";

        emptyState.append(heading, message, link);
        plansContainer.appendChild(emptyState);
        return;
    }

    plans.forEach((plan) => {
        plansContainer.appendChild(
            createPlanCard(plan, {
                onOpen: openPlan,
                onDelete: deletePlan,
            }),
        );
    });
}

renderPlans();

// A second tab can change browser-local plans while this view is open.
window.addEventListener("storage", (event) => {
    if (event.key === SAVED_PLANS_STORAGE_KEY) {
        renderPlans();
    }
});
