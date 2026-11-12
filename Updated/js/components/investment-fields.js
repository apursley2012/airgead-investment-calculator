/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: investment-fields.js Provides the single reusable four-field      |
  |          investment-input structure used by Calculator and Compare.        |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

const fieldDefinitions = [
    {
        name: "startingBalance",
        label: "Starting balance",
        className: "money",
        min: "0.01",
        step: "0.01",
        prefix: "$",
    },
    {
        name: "monthlyDeposit",
        label: "Monthly deposit",
        className: "money",
        min: "0.01",
        step: "0.01",
        prefix: "$",
    },
    {
        name: "annualRate",
        label: "Annual rate",
        className: "percent",
        min: "0",
        step: "0.01",
        suffix: "%",
    },
    {
        name: "years",
        label: "Years",
        className: "short",
        min: "1",
        max: "80",
        step: "1",
    },
];

function createField(definition, id, value, includeName) {
    const field = document.createElement("div");
    const label = document.createElement("label");
    const wrapper = document.createElement("div");
    const input = document.createElement("input");

    field.className = "field";
    label.htmlFor = id;
    label.textContent = definition.label;

    input.id = id;
    input.className = definition.className;
    input.type = "number";
    input.value = value;
    input.min = definition.min;
    input.step = definition.step;
    input.required = true;

    if (definition.prefix || definition.suffix) {
        const unitDescription = document.createElement("span");
        unitDescription.className = "sr-only";
        unitDescription.id = `${id}-unit`;
        unitDescription.textContent = definition.prefix
            ? "Amount in dollars"
            : "Annual rate in percent";
        input.setAttribute("aria-describedby", unitDescription.id);
        field.append(label, unitDescription);
    }

    if (definition.max) {
        input.max = definition.max;
    }

    if (includeName) {
        input.name = definition.name;
    }

    if (definition.prefix || definition.suffix) {
        wrapper.className = "input-wrap";

        if (definition.prefix) {
            const prefix = document.createElement("span");
            prefix.className = "prefix";
            prefix.textContent = definition.prefix;
            wrapper.append(prefix);
        }

        wrapper.append(input);

        if (definition.suffix) {
            const suffix = document.createElement("span");
            suffix.className = "suffix";
            suffix.textContent = definition.suffix;
            wrapper.append(suffix);
        }

        field.append(wrapper);
    } else {
        field.append(label, input);
    }

    return field;
}

/**
 * Creates the four standard inputs inside a Calculator or Compare form.
 * The ID prefix prevents collisions when multiple forms share one page;
 * includeNames enables form data collection by field name.
 * @param {HTMLElement|null} container Destination for the input controls.
 * @param {{idPrefix?: string, values?: object, includeNames?: boolean}} [options]
 * @returns {void}
 */
export function renderInvestmentFields(
    container,
    { idPrefix = "", values = {}, includeNames = false } = {},
) {
    if (!container) {
        return;
    }

    const defaults = {
        startingBalance: "5000",
        monthlyDeposit: "250",
        annualRate: "5",
        years: "20",
    };

    container.replaceChildren(
        ...fieldDefinitions.map((definition) => {
            const id = `${idPrefix}${definition.name}`;
            const value = values[definition.name] ?? defaults[definition.name];

            return createField(definition, id, value, includeNames);
        }),
    );
}
