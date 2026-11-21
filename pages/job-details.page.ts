import { expect, Locator, Page } from '@playwright/test';
import { JobPortalHeaderComponent } from './components/job-portal-header.component';

export class JobDetailsPage {
  readonly portalHeader: JobPortalHeaderComponent;
  readonly jobTitle: Locator;
  readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.portalHeader = new JobPortalHeaderComponent(page);
    this.jobTitle = page.getByRole('heading', { level: 1 });
    this.saveButton = page.getByRole('button', { name: /^save/i });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.jobTitle).toBeVisible();
  }

  async expectTitleContains(text: string): Promise<void> {
    await expect(this.jobTitle).toContainText(text, { ignoreCase: true });
  }

  async saveJob(): Promise<void> {
    await this.saveButton.click();
  }
}
