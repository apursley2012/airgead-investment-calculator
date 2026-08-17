<!--
File: README.md
Document Title: Airgead Investment Calculator Browser Demo Report
Author: Alysha Pursley, Software Developer
Date: July 2026
-->

<div align="center">

<img src="assets/logo/airgead-mark.png" alt="Airgead Investment Calculator logo" width="200">

# Airgead Investment Calculator

### A Responsive Compound-Interest Calculator and Educational Browser Demo

**HTML · CSS · JavaScript · Canvas API · Local Storage · C++**

[Live Demo](https://apursley2012.github.io/airgead-investment-calculator/) · [Repository](https://github.com/apursley2012/airgead-investment-calculator)

</div>

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Purpose](#purpose)
3. [Design Goals](#design-goals)
4. [Features](#features)
5. [Application Pages](#application-pages)
6. [How the Calculator Works](#how-the-calculator-works)
7. [Calculation Model](#calculation-model)
8. [Project Architecture](#project-architecture)
9. [Technologies Used](#technologies-used)
10. [Data and Browser Storage](#data-and-browser-storage)
11. [Responsive Design](#responsive-design)
12. [Accessibility](#accessibility)
13. [Installation and Local Use](#installation-and-local-use)
14. [Deployment](#deployment)
15. [Using the Application](#using-the-application)
16. [Testing and Validation](#testing-and-validation)
17. [Browser Compatibility](#browser-compatibility)
18. [Original C++ Source](#original-c-source)
19. [Project Structure](#project-structure)
20. [Customization](#customization)
21. [Known Limitations](#known-limitations)
22. [Future Enhancements](#future-enhancements)
23. [Author](#author)
24. [License](#license)

---

## Project Overview

Airgead is an interactive investment calculator that shows how an initial balance can grow through compound interest. It compares two projections: one that allows the starting balance to grow on its own and one that adds a recurring monthly deposit.

I originally developed the project as a C++ console application. The calculation accepted an initial investment, monthly deposit, annual interest rate, and investment period, then produced yearly reports for both growth scenarios. I rebuilt that logic as a responsive static website so the project can be tested directly in a browser without compiling the source code.

The browser version keeps the original educational purpose while expanding the experience with:

- Live calculation updates
- A year-by-year results table
- Custom canvas charts
- Side-by-side scenario comparison
- Browser-based saved plans
- CSV export
- Supporting explanations, articles, and case-study content
- A responsive interface for mobile, tablet, and desktop screens

The application runs entirely on the client. It does not require a backend, database, user account, package installation, or build process.

---

## Purpose

The project was designed around a practical financial education scenario. The requested application needed to help users understand fiscal responsibility, investment growth, and the effect of compound interest through interaction instead of definitions alone.

I focused the application on four values:

1. The amount available at the beginning
2. The amount contributed each month
3. The estimated annual interest rate
4. The number of years the balance will grow

The comparison between growth with and without monthly deposits is the most important part of the application. It shows that a final balance is affected by both investment earnings and the principal added over time.

This is an educational projection tool. It is not intended to provide individualized financial advice or guarantee future investment performance.

---

## Design Goals

### Make the calculation understandable

I did not want the application to show only one large final number. The results identify total principal, interest earned, growth without deposits, and the value produced when monthly deposits are included.

### Preserve the original logic

The web version is based on the same monthly compounding concept used by the original C++ program. The presentation changed, but the project remains centered on the original investment-growth requirements.

### Keep the demo completely static

The finished site uses plain HTML, CSS, and JavaScript. It can be deployed directly to GitHub Pages and does not depend on a framework, server, database, or third-party API.

### Provide a complete portfolio experience

The project includes more than a calculator form. It provides an introduction, calculation tools, results, supporting documentation, articles, and the original source so visitors can understand both the application and the decisions behind it.

### Remain usable at every viewport width

All pages use fluid wrappers, responsive grids, flexible controls, and text wrapping. No full page is intended to extend past 100% of the viewport. On the detailed results page, the wide year-by-year table scrolls inside its own card at small widths instead of forcing the whole page to overflow.

---

## Features

### Investment Calculator

- Accepts an initial investment amount
- Accepts a recurring monthly deposit
- Accepts an annual interest rate
- Accepts an investment period of up to 80 years
- Prevents negative values from entering the calculation
- Updates projected balances while the input values change
- Displays the difference created by monthly contributions

### Detailed Results

- Shows the final balance with monthly deposits
- Shows the final balance without additional deposits
- Separates total principal from earned interest
- Displays a custom growth chart
- Provides a year-by-year data table
- Saves the current calculation to the browser
- Exports the detailed projection as CSV

### Scenario Comparison

- Places two investment plans side by side
- Allows independent starting balances
- Allows independent monthly deposits
- Allows independent annual rates
- Allows independent timeframes
- Updates both results immediately
- Displays principal and interest in a custom comparison chart

### Saved Plans

- Stores selected calculations in `localStorage`
- Lists the plan date, deposit amount, timeframe, final balance, and interest
- Reopens a saved plan on the detailed results page
- Deletes individual saved plans
- Keeps all saved information in the current browser

### Educational Content

- Explains the monthly compounding model
- Includes a project case study
- Includes supporting project notes
- Includes full-length articles about compound growth and development
- Keeps the original C++ source available for technical review

### Static Demo Behavior

- Uses a clearly labeled mock sign-in
- Does not create a real account
- Does not transmit login information
- Generates CSV files in the browser
- Requires no server-side processing

---

## Application Pages

| Page | File | Purpose |
|---|---|---|
| Home | `index.html` | Introduces the project and provides entry points to the calculator and supporting content. |
| Calculator | `pages/calculator.html` | Collects the four investment inputs and previews the projected balances. |
| Results | `pages/results.html` | Displays the detailed chart, summary values, year-by-year table, save action, and CSV export. |
| Compare | `pages/compare.html` | Compares two independently configured investment scenarios. |
| Saved Plans | `pages/saved-plans.html` | Displays and manages calculations saved in the current browser. |
| How It Works | `pages/how-it-works.html` | Explains the monthly compounding process and the static demo behavior. |
| Articles | `pages/articles.html` | Provides the central index for the project’s full-length articles. |
| Monthly Deposits Article | `pages/article-monthly-deposits.html` | Explains how recurring deposits affect principal, interest, and long-term growth. |
| C++ to Browser Article | `pages/article-cpp-to-browser.html` | Documents how the original console logic was converted into an interactive static application. |
| Case Study | `pages/case-study.html` | Describes the project problem, rebuild, architecture, and possible future work. |
| Project Notes | `pages/blog.html` | Provides shorter supporting notes about savings behavior and calculation logic. |
| Sign In | `pages/login.html` | Demonstrates a clearly identified browser-only mock sign-in flow. |

The shared shell component inserts the header, desktop navigation, mobile navigation, footer, and toast notification container into each page.

---

## How the Calculator Works

The calculator reads the following input values:

```text
Starting balance
Monthly deposit
Annual interest rate
Number of years
```

The annual percentage rate is converted into a monthly decimal rate:

```text
monthly rate = annual rate / 100 / 12
```

The application maintains two balances:

- `withDeposits`
- `withoutDeposits`

Each month, the calculation:

1. Applies the monthly interest rate to both balances.
2. Adds the monthly contribution to the deposit scenario.
3. Adds the contribution to the tracked principal.
4. Repeats the process for twelve months.
5. Records a row at the end of the year.

Each yearly result includes:

```text
year
withDeposits
withoutDeposits
totalDeposits
interestEarned
```

The results page and comparison page both use the same calculation function. This prevents separate parts of the application from producing different answers from the same inputs.

---

## Calculation Model

The core function is located in:

```text
js/lib/calculator.js
```

Its public calculation function is:

```javascript
calculateCompoundInterest(inputs)
```

Input values are converted to numbers before they enter the projection. Negative balances, deposits, and rates are clamped to zero. The number of years is rounded and limited to a maximum of 80.

At the end of each year, currency values are rounded to whole dollars for display and export. Earned interest is calculated as:

```text
interest earned = balance with deposits - total principal
```

This model is appropriate for demonstrating the relationship among contribution amount, time, assumed rate, principal, and compound growth. It does not account for every real financial variable, including:

- Changing interest rates
- Inflation
- Account fees
- Taxes
- Contribution timing differences between institutions
- Market volatility
- Withdrawal activity

---

## Project Architecture

### Shared Shell

`js/components/shell.js` defines the global navigation links and creates the common page shell. Keeping this markup in one component makes header and footer updates consistent across the site.

### Calculation Library

`js/lib/calculator.js` contains:

- Compound-interest calculations
- Currency formatting
- Current-calculation storage
- Saved-plan storage
- CSV creation and download behavior

### Chart Library

`js/lib/charts.js` uses the Canvas API to draw:

- The year-by-year growth chart
- The scenario comparison chart
- Grid lines and value labels
- Principal and interest segments

The charts resize when the viewport changes.

### Page Controllers

Scripts in `js/pages/` connect individual pages to the shared libraries:

| Script | Responsibility |
|---|---|
| `calculator.js` | Reads inputs, animates the displayed balance, updates summary values, and opens the results page. |
| `results.js` | Loads the current calculation, fills the table, draws the chart, saves plans, and exports CSV. |
| `compare.js` | Reads both scenarios and updates the comparison values and chart. |
| `saved-plans.js` | Renders, opens, and deletes locally saved plans. |
| `login.js` | Handles the clearly labeled mock sign-in demonstration. |
| `noop.js` | Supports pages that only require shared static behavior. |

---

## Technologies Used

| Technology | Use |
|---|---|
| HTML5 | Semantic page structure, forms, tables, articles, and navigation |
| CSS3 | Layout, visual design, responsive behavior, typography, and interaction states |
| JavaScript ES Modules | Calculation logic, page behavior, storage, exports, and shared components |
| Canvas API | Custom growth and comparison charts |
| Web Storage API | Current calculations, saved plans, and demo session state |
| Blob and Object URL APIs | Client-side CSV generation |
| C++ | Original console application and object-oriented calculation implementation |
| GitHub Pages | Static site hosting |

The project uses Google Fonts for the Fraunces and Inter typefaces. The application does not require npm packages or a JavaScript framework.

---

## Data and Browser Storage

Airgead does not use a remote database.

The application uses the following `localStorage` keys:

| Key | Stored Value |
|---|---|
| `airgead_current_calc` | The most recent inputs, yearly results, and update time |
| `airgead_saved_plans` | The collection of plans saved by the user |
| `airgead_user` | The email entered into the mock sign-in demonstration |

Stored data:

- Remains in the current browser
- Is not synchronized between devices
- Is not sent to a server
- Can be removed by clearing site data

The sign-in page is demonstration-only. It does not provide authentication or account security.

---

## Responsive Design

I designed the application to remain usable on mobile, tablet, laptop, and desktop viewports.

Responsive behavior includes:

- Fluid wrappers that remain inside the viewport
- A mobile menu below the desktop navigation breakpoint
- Single-column card layouts on smaller screens
- Full-width form fields where fixed desktop widths would not fit
- Flexible action toolbars
- Currency values that scale with `clamp()`
- Text wrapping for headings, labels, buttons, and generated plan names
- Charts constrained to their parent cards
- A table-specific horizontal scrolling container
- Cards and content sections that never require full-page horizontal scrolling

The year-by-year results table keeps a readable minimum width. On a narrow phone, the user can scroll that table within the table card while the header, chart, summary, and rest of the page stay fixed to the viewport width.

---

## Accessibility

The application includes:

- Semantic headings and page regions
- Standard labeled form controls
- Descriptive image alternative text
- Button elements for application actions
- Link elements for navigation
- Visible keyboard focus styling on inputs
- `aria-label` values for icon-only controls
- `aria-expanded` on the mobile menu button
- A live status region for toast messages
- Color choices with clear light and dark contrast
- Text labels in addition to chart colors
- Responsive text wrapping instead of clipped content

Canvas charts support the visual presentation, while the same result values remain available as text and tabular data.

---

## Installation and Local Use

### Download the Project

1. Open the repository on GitHub.
2. Select **Code**.
3. Select **Download ZIP**.
4. Extract the downloaded archive.

You can also clone the repository:

```bash
git clone https://github.com/apursley2012/airgead-investment-calculator.git
cd airgead-investment-calculator
```

### Run the Browser Demo

Because the project uses JavaScript modules, run it through a local web server instead of opening `index.html` with a `file://` URL.

With Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

With the VS Code Live Server extension:

1. Open the project folder in VS Code.
2. Open `index.html`.
3. Select **Open with Live Server**.

No dependency installation or build command is required.

---

## Deployment

### GitHub Pages

1. Push the complete project to the repository’s default branch.
2. Open the repository’s **Settings**.
3. Select **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the default branch and the root folder.
6. Save the configuration.

The project uses relative links and assets, so it can run from a GitHub Pages repository path without a build step.

The expected address is:

```text
https://apursley2012.github.io/airgead-investment-calculator/
```

If the final repository name changes, update the demo and repository links at the top of this README.

---

## Using the Application

### Run a Calculation

1. Open the **Calculator** page.
2. Enter a starting balance.
3. Enter a monthly deposit.
4. Enter an estimated annual interest rate.
5. Enter the number of years.
6. Review the live balance comparison.
7. Select **View Details**.

### Review Detailed Results

The Results page displays:

- Final balance with deposits
- Total principal
- Interest earned
- Final balance without deposits
- Growth chart
- Year-by-year table

Select **Save Plan** to keep the calculation in the current browser, or select **Export CSV** to download the yearly data.

### Compare Two Plans

1. Open **Compare**.
2. Change the values in Scenario A.
3. Change the values in Scenario B.
4. Review the updated final balances.
5. Use the chart to compare principal and earned interest.

### Reopen a Saved Plan

1. Save a calculation from the Results page.
2. Open **Saved Plans**.
3. Select **View Details** on the plan.
4. Delete the plan when it is no longer needed.

---

## Testing and Validation

The project should be checked after changes to calculation logic, layout, navigation, or storage behavior.

### Functional Checks

- Confirm all four calculator inputs update the preview.
- Confirm **View Details** opens a populated results page.
- Confirm the results table contains year zero through the selected final year.
- Confirm the final table row matches the summary values.
- Confirm both comparison scenarios update independently.
- Confirm saving creates a card on the Saved Plans page.
- Confirm reopening a plan restores the correct detailed results.
- Confirm deleting a plan removes only the selected plan.
- Confirm CSV export contains the displayed year-by-year data.
- Confirm the mock sign-in remains clearly labeled as a demonstration.

### Responsive Checks

- Check the site at approximately 320, 375, 768, 1024, and 1440 pixels wide.
- Confirm the page does not produce full-page horizontal scrolling.
- Confirm the navigation changes to the mobile menu before the links collide.
- Confirm calculator fields remain fully visible.
- Confirm large currency values wrap or scale instead of leaving their cards.
- Confirm charts remain inside their containers.
- Confirm only the results table scrolls horizontally when necessary.
- Confirm article text remains readable without side-to-side scrolling.

### Content Checks

- Confirm every header and footer link resolves.
- Confirm all logo paths load from `assets/logo/`.
- Confirm article pages link back to the article index.
- Confirm no placeholder notes are visible in the finished site or README.

---

## Browser Compatibility

The application is intended for current versions of:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Apple Safari
- Mobile Safari
- Chrome for Android

The browser must support:

- ES modules
- `localStorage`
- Canvas
- `Blob`
- `URL.createObjectURL()`

Older browsers without modern JavaScript module support are not targeted.

---

## Original C++ Source

The `source/` folder preserves the original console application:

| File | Purpose |
|---|---|
| `airgeadBankingApp.cpp` | Runs the program, collects inputs, and displays the investment reports. |
| `investment.h` | Declares the investment class and its public interface. |
| `investment.cpp` | Implements investment calculations and report behavior. |

To compile the original source with `g++`:

```bash
cd source
g++ airgeadBankingApp.cpp investment.cpp -o airgead
```

Run it on macOS or Linux:

```bash
./airgead
```

Run it on Windows PowerShell:

```powershell
.\airgead.exe
```

The static browser demo and C++ source represent two interfaces for the same core project concept. The C++ files show the original object-oriented implementation, while the web version makes the calculation accessible online.

---

## Project Structure

```text
airgead-investment-calculator/
├── index.html
├── README.md
├── assets/
│   ├── logo/
│   │   ├── airgead-mark.png
│   │   └── airgead-mark-light.png
│   └── screenshots/
│       ├── airgead-console-screenshot1.png
│       └── airgead-console-screenshot2.png
├── css/
│   └── styles.css
├── js/
│   ├── components/
│   │   └── shell.js
│   ├── lib/
│   │   ├── calculator.js
│   │   └── charts.js
│   └── pages/
│       ├── calculator.js
│       ├── compare.js
│       ├── home.js
│       ├── login.js
│       ├── noop.js
│       ├── results.js
│       └── saved-plans.js
├── pages/
│   ├── article-cpp-to-browser.html
│   ├── article-monthly-deposits.html
│   ├── articles.html
│   ├── blog.html
│   ├── calculator.html
│   ├── case-study.html
│   ├── compare.html
│   ├── how-it-works.html
│   ├── login.html
│   ├── results.html
│   └── saved-plans.html
└── source/
    ├── airgeadBankingApp.cpp
    ├── investment.cpp
    └── investment.h
```

---

## Customization

### Change Colors

The main design tokens are CSS custom properties at the beginning of:

```text
css/styles.css
```

They control:

- Green brand shades
- Gold accents
- Canvas and paper backgrounds
- Text colors
- Border colors
- Shadows
- Card radius

### Change Navigation

Update the `links` array in:

```text
js/components/shell.js
```

The same array builds the desktop and mobile navigation.

### Change Calculator Defaults

Edit the `value` attributes in:

```text
pages/calculator.html
pages/compare.html
```

### Change Calculation Rules

Update:

```text
js/lib/calculator.js
```

Any calculation change should be tested on the Calculator, Results, and Compare pages.

### Add an Article

1. Copy an existing article page in `pages/`.
2. Replace its title, description, heading, metadata, and article content.
3. Add a new article card to `pages/articles.html`.
4. Confirm the page uses `../css/styles.css`.
5. Confirm the page loads `../js/components/shell.js`.

---

## Known Limitations

- The application uses estimated fixed rates rather than real market data.
- Currency is displayed in whole dollars.
- The model does not include taxes, fees, inflation, or withdrawals.
- Saved plans remain only in the current browser.
- Clearing site data removes saved plans.
- The mock sign-in is not real authentication.
- The application does not synchronize data between devices.
- Canvas charts are visual summaries; exact values are provided separately in text and tables.

---

## Future Enhancements

- Add optional inflation-adjusted values
- Add variable contribution schedules
- Add withdrawal modeling
- Add account fees and tax assumptions
- Add contribution timing options
- Add more detailed chart legends and tooltips
- Add a print-friendly results report
- Add PDF export
- Add import support for previously exported plans
- Add automated unit tests for known calculation scenarios
- Add more educational articles about budgeting and long-term planning
- Add optional real account sync only if a secure backend is introduced

---

## Author

**Alysha Pursley**  
Software Developer

- GitHub: [apursley2012](https://github.com/apursley2012)
- Portfolio: [apursley2012.github.io/eportfolio](https://apursley2012.github.io/eportfolio/)

---

## License

This project is part of my software development portfolio. Unless a separate license file states otherwise, the source and project content may not be redistributed or presented as another person’s work.

---

<div align="center">

**Airgead Investment Calculator**

© 2026 Alysha Pursley. All rights reserved.

</div>
