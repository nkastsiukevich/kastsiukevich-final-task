# kastsiukevich-final-task

Playwright + TypeScript UI tests for [ikea.com](https://www.ikea.com/) using the Page Object Model.

## Getting started

Install the dependencies and the Playwright browser:

```sh
npm install
npx playwright install
```

Run the tests:

```sh
npx playwright test             # all tests, headless
npx playwright test --headed    # with a visible browser
npx playwright test --ui        # interactive UI mode, step by step
npx playwright show-report      # open the latest HTML report
```

Tests run in Chromium. The default storefront is IKEA UK (`https://www.ikea.com/gb/en/`). Another region can be set with `BASE_URL`, for example in PowerShell:

```powershell
$env:BASE_URL="https://www.ikea.com/ie/en/"; npx playwright test
```

Locators rely on English UI texts, so non-English regions may need adjusted locators.

## Project structure

| Folder              | Contents                                                                         |
| ------------------- | -------------------------------------------------------------------------------- |
| `tests/`            | Test specs: scenario steps and assertions only                                   |
| `pages/`            | Page objects: locators and actions for each page                                 |
| `pages/components/` | Reusable page parts: shop header, jobs portal header, job alert form             |
| `fixtures/`         | Playwright fixtures that open the start page of each scenario and accept cookies |
| `test-data/`        | Search terms, job alert data, product data                                       |
| `config/`           | Routes and URL patterns                                                          |
| `utils/`            | Cookie consent handler, unique email generator                                   |

## Scenarios

| Scenario                     | Spec                     | What is checked                                                                                                                            |
| ---------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Search for a job          | `job-search.spec.ts`     | Opens Careers → IKEA Jobs portal, searches for "Manager" (falls back to "Designer" on 0 results), opens the first job and checks its title |
| 1. Save job                  | `job-search.spec.ts`     | Save, Saved jobs counter and saved job title — marked `test.fixme` (see Limitations)                                                       |
| 2. Subscribe for a job alert | `job-alert.spec.ts`      | Generated email, category, location from autocomplete, Sign Up and the exact confirmation message                                          |
| 3. Own test case             | `product-search.spec.ts` | Searches for "BILLY" in the shop, checks product results and opens the product page                                                        |

Latest run: **3 passed, 1 fixme**.

## Limitations

- **Live site.** Tests run against the live IKEA UK site and the global IKEA Jobs portal. Job availability, location autocomplete and cookie banner timing are not under our control.
- **Save / Saved jobs.** The current IKEA Jobs portal has no Save control on job pages, so scenario 1 steps 9–12 cannot run. The test is kept as `test.fixme` with all steps ready to enable once the feature exists.
- **Jobs tab.** IKEA UK has no top-level "Jobs" tab. The footer link "Careers with IKEA" is used instead, and the "Explore available jobs" button is called "Explore our job opportunities" on this site.
- **Fallback.** If "Manager" returns 0 jobs, "Designer" is used and the title is checked against it (scenario step 6). A `fallback` annotation appears in the HTML report when this happens.
- **Job alert form.** The jobs portal re-renders the page after the delayed cookie banner is accepted, which clears the form. The test refills the form with `expect(...).toPass()` until all fields are filled.
- **Job alert order.** In the assignment the category is added before the location is entered. On the portal the "Add" button stays disabled until a location is selected, so the test selects the category, then the location, and then clicks "Add".

## Code review

See [test-review.md](test-review.md) for the AI code review, the senior QA review and the table of applied fixes.
