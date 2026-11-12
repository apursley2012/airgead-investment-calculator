/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: footer.js Provides the single shared footer implementation used   |
  |          across every browser-demo page.                                   |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

import { brandMarkup } from './brand.js';

/**
 * Builds the shared footer using a page-relative site-root path.
 * @param {string} root Relative path from the current page to the site root.
 * @returns {string} Footer HTML.
 */
export function footerMarkup(root) {
  return `
		<footer class="footer">
			<div class="wrap footer-grid">
				<div>
					${brandMarkup(root, { light: true, showName: true })}
					<p>
						Airgead is a static compound interest calculator that
						demonstrates yearly growth with and without monthly deposits.
					</p>
				</div>

				<div>
					<h2>Tools</h2>
					<ul>
						<li><a href="${root}pages/calculator.html">Calculator</a></li>
						<li><a href="${root}pages/compare.html">Compare Scenarios</a></li>
						<li><a href="${root}pages/saved-plans.html">Saved Plans</a></li>
					</ul>
				</div>

				<div>
					<h2>Project</h2>
					<ul>
						<li><a href="${root}pages/how-it-works.html">How It Works</a></li>
						<li><a href="${root}pages/case-study.html">Case Study</a></li>
						<li><a href="${root}pages/articles.html">Articles</a></li>
						<li><a href="${root}pages/blog.html">Development Journal</a></li>
					</ul>
				</div>
			</div>

			<div class="wrap copyright">
				Airgead Compound Interest Calculator. © 2026 Alysha Pursley.
				<span> · <a href="${root}pages/privacy.html">Privacy</a>
				 · <a href="${root}pages/terms.html">Terms</a>
				 · <a href="${root}pages/disclaimer.html">Financial Disclaimer</a>
				 · <a href="${root}pages/accessibility.html">Accessibility</a></span>
			</div>
		</footer>
	`;
}
