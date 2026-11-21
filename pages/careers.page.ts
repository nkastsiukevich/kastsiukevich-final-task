import { expect, Locator, Page } from '@playwright/test';
import { URL_PATTERNS } from '../config/routes';
import { JobSearchPage } from './job-search.page';

export class CareersPage {
  readonly exploreJobsLink: Locator;

  constructor(private readonly page: Page) {
    // The assignment calls it "Explore available jobs"; on IKEA UK the same CTA is "Explore our job opportunities".
    this.exploreJobsLink = page.getByRole('link', { name: 'Explore our job opportunities', exact: true }).first();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.exploreJobsLink).toBeVisible();
  }

  /** The careers CTA navigates the current tab to the IKEA Jobs portal. */
  async openJobSearch(): Promise<JobSearchPage> {
    await this.exploreJobsLink.click();
    await expect(this.page).toHaveURL(URL_PATTERNS.jobPortal);

    const jobSearchPage = new JobSearchPage(this.page);
    await jobSearchPage.expectLoaded();
    return jobSearchPage;
  }
}
