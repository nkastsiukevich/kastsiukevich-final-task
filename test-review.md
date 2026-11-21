# IKEA Playwright test reviews

## AI review

The generated tests have a clear POM-oriented structure: specs orchestrate scenarios while page objects encapsulate navigation and UI interactions. Test names and `test.step()` descriptions make the flows readable, shared job criteria are kept in test data, and the subscription address is generated uniquely for each run. Semantic role-based locators and Playwright's auto-waiting are preferable to fixed sleeps.

There are important coverage and stability caveats. The Manager-to-Designer fallback can change which title is asserted; this should not silently weaken the explicit Manager requirement. The Save/Saved jobs part is skipped because the inspected IKEA Jobs portal does not expose those controls, and the job-alert test may be skipped if location autocomplete does not offer a selection. These skips are transparent but do not count as passing coverage. The live storefront and job portal can change independently, and UI selectors should be scoped to the relevant job/product cards and form controls.

Scenario 3 is a useful independent smoke test for IKEA product search. Its result assertion should be limited to product-result elements to reduce false positives. Remove stale or unused page-object locators and test data as the suite evolves.

## Senior QA review

## My review

### Scope and verdict

I reviewed the three specs (`job-search.spec.ts`, `job-alert.spec.ts`, `product-search.spec.ts`), their page objects, components, fixtures and test data, and then ran the tests against the live site while fixing them.

**Verdict at the time of review: request changes.** The structure was good, but Scenarios 1 and 2 were not really covered: both specs could end as "skipped", and a skipped test does not prove that the scenario works. Scenario 3 was a valid test case, but its result locator was too broad.

### Findings

**Scenario 1 — fallback and title check.** I agree with the AI review that the title check silently followed the fallback term. I do not fully agree that the test must always check "Manager": step 6 of the assignment allows the fallback, and after a fallback search a "Manager" check would always fail. My decision: keep the fallback, but make it visible — a `fallback` annotation appears in the report when it is used. This interpretation needs to be confirmed with the mentor.

**Scenario 1 — Save / Saved jobs.** The current IKEA Jobs portal has no Save control on job pages, so steps 9–12 cannot be automated. The original code decided this at runtime with `isVisible()`, which does not wait, so a slow page could skip the test by mistake. I replaced this with an explicit `test.fixme` and a documented reason. I also found that "Saved jobs" on the portal is a button showing "Saved jobs (0)", not a link, so the locator had to change even for the future.

**Scenario 2 — the real reason the job alert test was skipped.** The AI review explained the skip as an external dependency (live autocomplete). While fixing the test I found two different causes in our own code and in the page behaviour:

1. The location was entered with `fill()`, which pastes the text at once. The autocomplete only reacts to key presses, so I changed it to `pressSequentially()`.
2. The jobs portal shows the cookie banner with a delay, and after it is accepted the page re-renders and clears the whole form. The page snapshot at the failure showed an empty email field and the default category, although the test had filled them. I wrapped the form filling in `expect(...).toPass()`, so it is refilled until email, category and the Add button are all in the right state.

So the problem was not "external and nothing to do about it" — it was fixable.

**Scenario 2 — step order.** In the assignment the category is added before the location is entered. On the portal the "Add Job Alert" button is disabled while the location is empty, so the test selects the category, then the location, and then clicks Add. This is documented in the README.

**Scenario 2 — confirmation.** The success message is a plain paragraph "Your subscription was submitted successfully." with a Close button, not a status or alert element. The first fix searched only status/alert/dialog/heading elements and failed. Now the test checks this exact text inside `main`.

**Navigation.** IKEA UK has no "Jobs" tab, and the button is called "Explore our job opportunities", not "Explore available jobs". The original code skipped this step with a direct `goto`. Now the test clicks the footer link "Careers with IKEA" and checks the URL after each navigation.

**Scenario 3 — locators.** I agree with the AI review: all links in `main` could give a false positive. Results are now limited to product card titles (`h3 > link`), and the test also opens the product page.

**Stability observation.** In one full run with 4 parallel workers the product test timed out waiting for the product page, while it passed alone in about 8 seconds and in the next full runs. I see this as a live-site loading risk, not a locator problem. If it repeats, the number of workers should be reduced.

### Review points

| Point                             | My assessment                                                                                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| POM structure                     | Good: pages and reusable components (shop header, jobs portal header, job alert form) are separated; navigation methods return the next page object. |
| Separation of test and page logic | Good: specs contain only steps and assertions; locators and actions are in page objects; setup is in fixtures.                                       |
| Readability                       | Good: `test.step()` names follow the scenario steps.                                                                                                 |
| Naming                            | Mostly good. I renamed a variable `page` that actually held a search results page object, because it could be confused with Playwright's `Page`.     |
| Locators                          | Role-based and mostly stable. Fixed: button vs link for Saved jobs, the exact "Add Job Alert" name, product results scope, the confirmation message. |
| Assertions                        | Web-first `expect` with auto-waiting. Fixed: no more `isVisible()` probes, the confirmation is checked by exact text.                                |
| DRY                               | Fixtures remove repeated setup; the search-and-open steps are shared in Scenario 1 by a helper.                                                      |
| Hardcoded values                  | Test data and URL patterns are in `test-data/` and `config/`. The `/en/job/` link pattern stays in the page object — acceptable for this portal.     |
| Stability and flakiness           | No fixed sleeps. Main risks: live data, delayed cookie banner re-rendering the page, autocomplete, page load time in parallel runs.                  |
| Maintainability                   | Adding a scenario means a new spec and, if needed, a page object; changing data does not require code changes.                                       |

## Comments added to the generated tests

Review comments are added inline to the Scenario 3 test (`tests/product-search.spec.ts`), marked `// Review (<review point>):`. They cover POM usage, naming, locators, assertions, hardcoded values, separation of logic, stability and maintainability. In the Scenario 1 and 2 specs the review findings were fixed in code; each fix is listed in the table below.

## Comparison: AI review vs. my review

**Where we agree.** Both reviews find the POM structure, readable steps, generated email, role-based locators and the absence of fixed sleeps positive. Both point out that a skipped test is not coverage, that the product results locator was too broad, and that the tests depend on the live site.

**Where my review differs.**

- The AI review treated the skipped job alert test as an external autocomplete problem. Running the test showed that the causes were `fill()` instead of typing and the page re-render after the delayed cookie banner — both fixable in the test.
- The AI review suggested always asserting "Manager". I kept the fallback check, because step 6 of the assignment allows the fallback, and made it visible in the report instead.
- The AI review suggested a controlled test environment or mocks for stability. That is right for a real project, but out of scope for this task, which asks to test the live IKEA site.
- My review adds things the AI review could not see without running the tests: the disabled Add button before a location is selected, the exact confirmation element, and the timeout seen only in a parallel run.

**Conclusion.** The AI review was useful for structure, naming and locator quality. Running and debugging the tests was necessary to find the real causes of the failures.

## Recommendation

Agree with the mentor whether Save / Saved jobs may stay as a documented `test.fixme` and whether checking the fallback title is acceptable. Keep Scenario 3 as a smoke test. Watch the full parallel run for timeouts on the product page.

## Fixes applied after the review

| Review finding                                                              | Fix                                                                                                                                                                                                                         | Status                                       |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| P1: title check silently follows the fallback term                          | Primary and fallback terms are separate in `test-data/jobs.data.ts`. When the fallback is used, a `fallback` annotation appears in the HTML report. Checking the fallback term follows scenario step 6.                     | Fixed, interpretation to confirm with mentor |
| P1: Save flow skipped by an immediate `isVisible()` probe                   | Runtime probe and `test.skip` removed. Scenario 1 is split: search + title check runs; Save / Saved jobs is a separate `test.fixme` with the reason documented.                                                             | Known gap, to agree with mentor              |
| P1: Saved jobs is a button, not a link                                      | `JobPortalHeaderComponent` uses `getByRole('button')`.                                                                                                                                                                      | Fixed                                        |
| P1: saved jobs list scoped to every list item                               | `SavedJobsPage` counts only links to job postings.                                                                                                                                                                          | Fixed                                        |
| P1: job alert skipped when autocomplete is empty                            | `subscribe()` no longer returns `false` and the test has no skip. Location is typed with `pressSequentially()` so the autocomplete reacts; a missing suggestion fails the test.                                             | Fixed                                        |
| P1: "Add" accessible name mismatch                                          | Locator uses the exact accessible name "Add Job Alert". The added location is verified before sign-up.                                                                                                                      | Fixed                                        |
| P1: confirmation matched against generic page text                          | The exact message "Your subscription was submitted successfully." is checked in a paragraph inside `main`.                                                                                                                  | Fixed                                        |
| Found during fixing: job alert form cleared after the delayed cookie banner | The portal re-renders after the cookie banner is accepted, which clears the form. Form filling is wrapped in `expect(...).toPass()`; each attempt refills all fields and checks email, category and the enabled Add button. | Fixed                                        |
| P2: Jobs step done with direct `goto`                                       | `HomePage.goToJobs()` clicks the footer link "Careers with IKEA" (no Jobs tab on IKEA UK) and asserts the URL.                                                                                                              | Fixed, regional difference documented        |
| P2: careers CTA navigation not asserted                                     | `CareersPage.openJobSearch()` asserts the job portal URL. URL patterns are in `config/routes.ts`.                                                                                                                           | Fixed                                        |
| P2: product results locator too broad                                       | `SearchResultsPage` uses only product card titles (`h3 > link`). Scenario 3 also opens the product and checks its name.                                                                                                     | Fixed                                        |
| Dead code                                                                   | Removed `HomePage.jobsLink`, `JobSearchPage.noResultsMessage`, `productData.expectedBagCount`, unused `ProductPage.addToBag`.                                                                                               | Fixed                                        |
| P2: live site dependency                                                    | Documented in the README Limitations section (region via `BASE_URL`, live data, autocomplete and cookie banner timing are external).                                                                                        | Documented                                   |

## Result after fixes

Full run (4 workers): **3 passed, 1 fixme** (Save / Saved jobs).
