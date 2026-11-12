/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: shell.js Composes the shared navigation, footer, and feedback     |
  |          components around each browser-demo page.                         |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

import { initializeNavigation, navigationMarkup } from "./navigation.js";
import { footerMarkup } from "./footer.js";
import { toastMarkup } from "./toast.js";
import { renderPageHeaders } from "./page-header.js";

function pathToRoot() {
    // Resolve the publishing root from this module, not the repository name:
    // a GitHub Pages repository can itself be named "pages".
    const siteRoot = new URL("../../", import.meta.url);
    if (document.documentElement.dataset.notFound === "true") {
        // The 404 page may be rendered at any unknown path, including nested URLs.
        return siteRoot.pathname;
    }
    const pageDirectory = new URL(".", location.href);
    return pageDirectory.pathname === siteRoot.pathname ? "" : "../";
}

export function renderShell() {
    // Older demos persisted an entered email unnecessarily. Remove that
    // legacy personal data whenever any page in the updated site opens.
    try {
        localStorage.removeItem("airgead_user");
    } catch {
        // Storage may be blocked; the application remains usable without it.
    }

    const shell = document.querySelector("[data-shell]");

    if (!shell) {
        return;
    }

    const root = pathToRoot();
    const current = location.pathname.split("/").pop() || "index.html";

    shell.insertAdjacentHTML("afterbegin", navigationMarkup(root, current));
    shell.insertAdjacentHTML(
        "beforeend",
        `${footerMarkup(root)}${toastMarkup()}`,
    );

    renderPageHeaders();
    initializeNavigation();
}

// Importing the shell module initializes the shared layout on every page.
renderShell();
