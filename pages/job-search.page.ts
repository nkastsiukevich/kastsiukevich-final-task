import { expect, Locator, Page } from '@playwright/test';
import { JobAlertComponent } from './components/job-alert.component';
import { JobDetailsPage } from './job-details.page';

export class JobSearchPage {
  readonly jobAlert: JobAlertComponent;
  readonly keywordInput: Locator;
  readonly searchButton: Locator;
  readonly resultsSummary: Locator;
  readonly jobResultLinks: Locator;

  constructor(private readonly page: Page) {
    this.jobAlert = new JobAlertComponent(page);
    this.keywordInput = page.getByRole('searchbox', { name: /keyword search/i });
    this.searchButton = page.locator('form.search-form').getByRole('button', { name: 'Search jobs' });
    // Shown for both outcomes, e.g. "12 results for Manager" or "0 results for Manager".
    this.resultsSummary = page.getByRole('heading', { level: 1, name: /^\d+ results? for /i });
    this.jobResultLinks = page.locator('a[href*="/en/job/"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.keywordInput).toBeVisible();
  }

  /** Searches by keyword only; the postcode field is intentionally left empty. */
  async search(keyword: string): Promise<void> {
    await this.keywordInput.fill(keyword);
    await this.searchButton.click();
  }

  /**
   * Tries each term in order. If a search returns 0 jobs, goes back and tries the next one.
   * Returns the term that produced results.
   */
  async searchWithFallback(terms: readonly string[]): Promise<string> {
    for (const term of terms) {
      await this.search(term);
      if (await this.hasResults()) {
        return term;
      }
      await this.page.goBack();
      await this.expectLoaded();
    }
    throw new Error(`No jobs found for any of the terms: ${terms.join(', ')}`);
  }

  async openFirstResult(): Promise<JobDetailsPage> {
    await this.jobResultLinks.first().click();
    const jobDetailsPage = new JobDetailsPage(this.page);
    await jobDetailsPage.expectLoaded();
    return jobDetailsPage;
  }

  /** Waits until the search finishes (the results summary appears) and then checks the count. */
  private async hasResults(): Promise<boolean> {
    await expect(this.resultsSummary).toBeVisible();
    const summary = (await this.resultsSummary.innerText()).trim();
    if (/^0 results? for /i.test(summary)) {
      return false;
    }
    return (await this.jobResultLinks.count()) > 0;
  }
}
