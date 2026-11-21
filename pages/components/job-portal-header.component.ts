import { expect, Locator, Page } from '@playwright/test';
import { SavedJobsPage } from '../saved-jobs.page';

/** Header of the IKEA jobs portal (contains the "Saved jobs" counter). */
export class JobPortalHeaderComponent {
  readonly savedJobsButton: Locator;

  constructor(private readonly page: Page) {
    // On the current portal "Saved jobs" is a button, not a link.
    this.savedJobsButton = page.getByRole('button', { name: /saved jobs/i });
  }

  async expectSavedJobsCount(count: number): Promise<void> {
    await expect(this.savedJobsButton).toContainText(new RegExp(`\\b${count}\\b`));
  }

  async openSavedJobs(): Promise<SavedJobsPage> {
    await this.savedJobsButton.click();
    const savedJobsPage = new SavedJobsPage(this.page);
    await savedJobsPage.expectLoaded();
    return savedJobsPage;
  }
}
