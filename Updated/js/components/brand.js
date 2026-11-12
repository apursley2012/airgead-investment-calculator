/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: brand.js Provides the single shared Airgead brand/logo markup     |
  |          used by navigation and footer components.                         |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

/**
 * Builds shared brand markup using a page-relative path to the site root.
 * @param {string} root Relative root ('' on the homepage, '../' on nested pages).
 * @param {{light?: boolean, showName?: boolean}} [options]
 * @returns {string} HTML for the home link and logo.
 */
export function brandMarkup(root, { light = false, showName = false } = {}) {
    const logoFile = light ? "airgead-mark-light.png" : "airgead-mark.png";
    const name = showName ? "<span>Airgead</span>" : "";

    return `
		<a class="brand" href="${root}index.html">
			<img
				src="${root}assets/logo/${logoFile}"
				alt="${showName ? "" : "Airgead home"}"
			>
			${name}
		</a>
	`;
}
