<!--
Document: Airgead Investment Calculator — Portfolio Project
Author: Alysha Pursley
Copyright (c) 2026 Alysha Pursley.
-->

# Airgead Investment Calculator

I built Airgead to make compound-interest calculations easier to understand. The project began as a **C++17 console application** that calculates and reports investment growth with and without recurring monthly deposits. I then created a **static browser companion** so visitors can explore the same calculation through interactive forms, charts, yearly results, and scenario comparisons.

This repository keeps those two implementations separate. The browser site is a demonstration of the original calculation, **not** the original C++ application running in a browser.

## What I built

- **`Original/`** — my C++ console application, with its own calculation implementation, validated input, year-by-year reporting, and C++ regression tests.
- **`Updated/`** — my standalone HTML, CSS, and native JavaScript website, designed for static hosting such as GitHub Pages.

On the website, visitors can calculate projected growth, compare two scenarios, inspect yearly balances, export CSV reports, and save plans **in their own browser**. The demo sign-in does not create an account or provide real authentication. It stores only a temporary session indicator in the current tab, not the email address or password entered into the form.

The site is an educational model, not an investment recommendation or a prediction of future returns. It assumes a constant annual rate divided into twelve monthly steps; in the deposit scenario, the monthly contribution is added **before** that month's interest is calculated. Taxes, fees, inflation, withdrawals, changing rates, and market losses are outside this model.

## How I organized the website

| Location | Responsibility |
| --- | --- |
| `index.html` | Homepage |
| `404.html` | Custom fallback for missing pages |
| `pages/` | Calculator, comparison, results, saved plans, articles, project case study, and legal pages |
| `css/shared.css` | Shared design tokens, typography, navigation, layout, and responsive rules |
| `css/pages/` | Page-specific styles |
| `js/lib/` | Financial calculation, local storage, charts, and CSV export |
| `js/components/` | Reusable navigation, footer, forms, tables, and other UI elements |
| `js/pages/` | Page-specific interactions |
| `assets/logo/` | Site branding |
| `assets/screenshots/` | Screenshots documenting the original C++ console program |
| `tests/` | Automated browser-source and calculation regression tests |

I deliberately used native JavaScript modules instead of introducing a frontend framework or a build pipeline for this static site.

## Running the website locally

From `Updated/`, serve the files over HTTP so that browser modules resolve correctly:

```bash
cd Updated
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

Python is only a convenient local static-file server; I did **not** build a Python backend, server-side account system, or database for this project. The deployed site needs only a compatible browser and a static host.

## Running my tests

From `Updated/`, use a recent Node.js version with the built-in test runner (I used Node.js 22):

```bash
cd Updated
node --test tests/*.test.mjs
```

The tests cover the mathematical rules, validation, local storage, CSV export, and website references. To compile and test the separate C++ implementation, see [`Original/README.md`](../Original/README.md). Node.js is for running the tests; visitors do not need Node.js to use the website.

These automated checks are not the same as verifying a published site. I also recommend checking navigation, calculations, responsive layouts, and downloads at the actual deployment URL after publishing.

## Publishing my website on GitHub Pages

I keep `Original/` and `Updated/` together in the source repository because they document two distinct implementations. **GitHub Pages does not automatically publish the contents of a nested `Updated/` folder** when branch publishing is configured for the repository root.

To deploy this structure without mixing the original C++ project into the website:

1. Keep both folders in my source branch (for example, `main`).
2. Create a publishing branch (for example, `gh-pages`) with the **contents of `Updated/` at the branch root**, not within an additional `Updated/` directory.
3. In **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, the publishing branch, and `/(root)`.
4. Once Pages reports success, visit the published URL and check the homepage, nested pages, mobile menu, calculator, comparison, saved plans, CSV export, and custom 404 page.

I can alternatively publish the contents of `Updated/` at the root of a separate website repository. No GitHub Actions deployment workflow is bundled with this archive, and the existence of these files does not prove that a live deployment has been completed.

The 404 page is intended for GitHub Pages and can resolve the project root even when the requested URL is nested. Other static hosts may require their own 404-routing configuration. The site uses relative paths so it can also work under a GitHub Pages repository subpath.

## Browser behavior and limitations

My website uses JavaScript, Canvas, `localStorage`, `sessionStorage`, and client-generated Blob downloads. Plans are stored in the current browser only: they are **not** encrypted account records, synchronized across devices, or guaranteed to survive clearing browser data. If storage is blocked, saving and reopening plans may not work.

The site loads **Inter** and **Fraunces** from Google Fonts. System fallback fonts are available when those requests fail. Other than those optional font requests and the normal requests made to the site host, the demo does not call an application API.

I built responsive layouts for narrow phones, tablets, and desktop screens, with an accessible mobile navigation menu and scrollable detailed tables. Responsive source and browser tests help find problems, but they do not replace testing on every physical device or a formal accessibility audit.

## Copyright, third-party credits, and site notices

Copyright © 2026 Alysha Pursley. I have included `LICENSE` notices with both implementations to state the current copyright and reuse status. **I have not granted an open-source reuse license** through those notices.

I use **Inter** by Rasmus Andersson and **Fraunces** by Phaedra Charles and Flavia Zimbardi (Undercase Type). Both are distributed through Google Fonts under the SIL Open Font License 1.1. The [third-party notices](THIRD_PARTY_NOTICES.md) identify only the externally loaded fonts and their delivery service, and include the SIL Open Font License text. My project assets and writing should not be assumed to grant others permission to reuse third-party materials.

I also included publicly linked **Privacy**, **Terms of Use**, **Financial Disclaimer**, and **Accessibility** pages. They explain the current educational, browser-local implementation; they are not legal certification. Before a public or commercial launch, I would check those notices against the actual hosting provider, asset rights, applicable laws, and any new integrations.

## Original C++ implementation

I maintain the original console application's source, build steps, and regression tests separately in [`Original/`](../Original/README.md). GitHub Pages cannot run the C++ executable, so the browser implementation should not be mistaken for the original runtime.
