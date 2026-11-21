import { expect, Locator, Page } from '@playwright/test';

export class SavedJobsPage {
  readonly heading: Locator;
  readonly savedJobLinks: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /saved jobs/i });
    // Only links to job postings count as saved jobs, not any list item on the page.
    this.savedJobLinks = page.getByRole('main').locator('a[href*="/en/job/"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  async expectSingleSavedJobWithTitle(text: string): Promise<void> {
    await expect(this.savedJobLinks).toHaveCount(1);
    await expect(this.savedJobLinks.first()).toContainText(text, { ignoreCase: true });
  }
}
