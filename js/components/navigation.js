/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: navigation.js Provides the shared desktop navigation and mobile   |
  |          menu so every page uses one navigation implementation.            |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

import { brandMarkup } from "./brand.js";

const links = [
	["Home", "index.html"],
	["Calculator", "pages/calculator.html"],
	["Compare", "pages/compare.html"],
	["Saved Plans", "pages/saved-plans.html"],
	["How It Works", "pages/how-it-works.html"],
	["Articles", "pages/articles.html"],
	["Case Study", "pages/case-study.html"],
];

function normalize(href) {
	return href.replace("../", "").replace("./", "");
}

function navigationLinksMarkup(root, current) {
	return links
		.map(([label, href]) => {
			const isActive = normalize(href).endsWith(current);

			return `
				<a
					class="${isActive ? "active" : ""}"
					href="${root}${href}"
					${isActive ? 'aria-current="page"' : ""}
				>
					${label}
				</a>
			`;
		})
		.join("");
}

/**
 * Builds desktop and mobile navigation for the current page.
 * @param {string} root Relative path from the page to the site root.
 * @param {string} current Current page filename for aria-current.
 * @returns {string} Shared navigation HTML.
 */
export function navigationMarkup(root, current) {
	const navigationLinks = navigationLinksMarkup(root, current);

	return `
		<a class="skip-link" href="#main-content">Skip to main content</a>
		<header class="topbar">
			<div class="wrap nav">
				${brandMarkup(root, { showName: true })}

				<nav class="links" aria-label="Primary navigation">
					${navigationLinks}
				</nav>

				<div class="nav-actions">
					<a class="btn btn-primary" href="${root}pages/login.html">
						Sign In
					</a>
				</div>

				<button
					class="menu-toggle"
					type="button"
					aria-label="Open menu"
					aria-expanded="false"
					aria-controls="mobile-navigation"
				>
					☰
				</button>
			</div>

			<nav id="mobile-navigation" class="mobile-panel wrap" aria-label="Mobile navigation" hidden>
				${navigationLinks}
				<a href="${root}pages/login.html">Sign In</a>
			</nav>
		</header>
	`;
}

export function initializeNavigation() {
	// Demo sign-in is only a tab-local indicator, not access control.
	// Provide a matching sign-out action so it can be cleared deliberately.
	let demoActive = false;
	try {
		demoActive = sessionStorage.getItem("airgead_demo_session") === "active";
	} catch {
		// The static site still works when session storage is unavailable.
	}

	if (demoActive) {
		document.querySelectorAll('a[href$="pages/login.html"]').forEach((link) => {
			link.textContent = "Sign Out";
			link.addEventListener("click", () => {
				try {
					sessionStorage.removeItem("airgead_demo_session");
				} catch {
					// Browser storage may be blocked; no protected data exists.
				}
			});
		});
	}

	const menuButton = document.querySelector(".menu-toggle");
	const mobilePanel = document.querySelector(".mobile-panel");

	if (!(menuButton instanceof HTMLButtonElement) || !(mobilePanel instanceof HTMLElement)) {
		return;
	}

	const navigationPanel = mobilePanel;
	const navigationToggle = menuButton;

	// Keep the hidden state and ARIA announcement synchronized for keyboard users.
	function setMenuOpen(isOpen) {
		navigationPanel.hidden = !isOpen;
		navigationPanel.classList.toggle("open", isOpen);
		navigationToggle.setAttribute("aria-expanded", String(isOpen));
		navigationToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
	}

	navigationToggle.addEventListener("click", () => {
		setMenuOpen(navigationPanel.hidden);
	});

	navigationPanel.addEventListener("click", (event) => {
		if (event.target instanceof Element && event.target.closest("a")) {
			setMenuOpen(false);
		}
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && !navigationPanel.hidden) {
			setMenuOpen(false);
			navigationToggle.focus();
		}
	});

	window.matchMedia("(min-width: 1081px)").addEventListener("change", (event) => {
		if (event.matches) {
			setMenuOpen(false);
		}
	});
}
