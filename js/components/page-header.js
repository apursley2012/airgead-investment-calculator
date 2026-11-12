/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: page-header.js Renders the repeated eyebrow/title/lead page-      |
  |          header structure from page-owned text attributes.                 |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

export function renderPageHeaders() {
    document.querySelectorAll("[data-page-header]").forEach((header) => {
        if (!(header instanceof HTMLElement)) return;
        const eyebrow = document.createElement("div");
        const title = document.createElement("h1");
        const lead = document.createElement("p");

        eyebrow.className = "eyebrow";
        eyebrow.textContent = header.dataset.eyebrow;
        title.textContent = header.dataset.title;
        lead.className = "lead";
        lead.textContent = header.dataset.description;

        header.replaceChildren(eyebrow, title, lead);
    });
}
