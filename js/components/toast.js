/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: toast.js Owns the reusable toast/status region and its timing     |
  |          behavior for browser-demo feedback.                               |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

let toastTimeoutId = null;

export function toastMarkup() {
    return `
		<div class="toast" role="status" aria-live="polite"></div>
	`;
}

/**
 * Announces transient feedback through the shared live region and resets
 * its dismissal timer when a new message arrives.
 * @param {string} message User-facing status text.
 * @returns {void}
 */
export function toast(message) {
    const element = document.querySelector(".toast");

    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.add("show");

    if (toastTimeoutId !== null) {
        clearTimeout(toastTimeoutId);
    }

    toastTimeoutId = setTimeout(() => {
        element.classList.remove("show");
        toastTimeoutId = null;
    }, 2400);
}
