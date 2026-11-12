/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: plan-card.js Builds the reusable saved-plan card while keeping    |
  |          stored plan text in safe DOM text nodes.                          |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

import { money } from "../lib/calculator.js";

/**
 * Creates a saved-plan card without interpreting the stored plan name as HTML.
 * @param {object} plan Validated saved-plan record with calculation results.
 * @param {{onOpen: Function, onDelete: Function}} actions
 * @returns {HTMLElement} A card whose buttons invoke the supplied callbacks.
 */
export function createPlanCard(plan, { onOpen, onDelete }) {
    const card = document.createElement("article");
    const deleteButton = document.createElement("button");
    const savedLabel = document.createElement("div");
    const heading = document.createElement("h2");
    const balanceText = document.createElement("p");
    const balance = document.createElement("strong");
    const openButton = document.createElement("button");
    const final = plan.data.results[plan.data.results.length - 1];
    const savedDate = new Date(plan.date);

    card.className = "card plan-card";

    deleteButton.className = "delete";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${plan.name}`);

    savedLabel.className = "eyebrow";
    savedLabel.textContent = `Saved ${savedDate.toLocaleDateString()}`;

    heading.className = "card-heading";
    heading.textContent = plan.name;

    balanceText.append("Final balance with deposits: ", balance);
    balance.textContent = money(final.withDeposits);

    openButton.className = "btn btn-primary open-plan";
    openButton.type = "button";
    openButton.textContent = "View Results";
    openButton.setAttribute("aria-label", `View results for ${plan.name}`);

    openButton.addEventListener("click", () => onOpen(plan));
    deleteButton.addEventListener("click", () => onDelete(plan.id));

    card.append(deleteButton, savedLabel, heading, balanceText, openButton);

    return card;
}
