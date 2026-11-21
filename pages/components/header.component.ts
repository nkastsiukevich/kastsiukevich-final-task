import { expect, Locator, Page } from '@playwright/test';
import { SearchResultsPage } from '../search-results.page';

/** Header of the main IKEA shop site (search and shopping bag). */
export class HeaderComponent {
  readonly searchInput: Locator;
  readonly shoppingBagLink: Locator;

  constructor(private readonly page: Page) {
    this.searchInput = page.getByRole('combobox', {
      name: /search for products, inspiration or new arrivals|search by product/i,
    });
    this.shoppingBagLink = page.getByRole('link', { name: /shopping bag/i });
  }

  async searchFor(term: string): Promise<SearchResultsPage> {
    await this.searchInput.fill(term);
    await this.searchInput.press('Enter');
    const resultsPage = new SearchResultsPage(this.page);
    await resultsPage.expectLoaded();
    return resultsPage;
  }

  async expectBagItemsCount(count: number): Promise<void> {
    await expect(this.shoppingBagLink).toContainText(new RegExp(`\\b${count}\\b`));
  }
}
