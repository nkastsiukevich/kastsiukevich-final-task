import { expect, Locator, Page } from '@playwright/test';
import { ROUTES, URL_PATTERNS } from '../config/routes';
import { CareersPage } from './careers.page';
import { HeaderComponent } from './components/header.component';

export class HomePage {
  readonly header: HeaderComponent;
  readonly careersLink: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    // IKEA UK has no top-level "Jobs" tab; the footer link "Careers with IKEA" is the equivalent entry point.
    this.careersLink = page.getByRole('contentinfo').getByRole('link', { name: 'Careers with IKEA' });
  }

  async open(): Promise<void> {
    await this.page.goto(ROUTES.home);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.header.searchInput).toBeVisible();
  }

  async goToJobs(): Promise<CareersPage> {
    await this.careersLink.click();
    await expect(this.page).toHaveURL(URL_PATTERNS.careers);
    const careersPage = new CareersPage(this.page);
    await careersPage.expectLoaded();
    return careersPage;
  }
}
