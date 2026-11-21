import { expect, Locator, Page } from '@playwright/test';
import { ProductPage } from './product.page';

export class SearchResultsPage {
  readonly productTitleLinks: Locator;

  constructor(private readonly page: Page) {
    // Only product card titles (h3 > link), not every link in the main area.
    this.productTitleLinks = page.getByRole('main').getByRole('heading', { level: 3 }).getByRole('link');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.productTitleLinks.first()).toBeVisible();
  }

  async expectResultsContain(productName: string): Promise<void> {
    await expect(this.productTitleLinksWithName(productName).first()).toBeVisible();
  }

  async openFirstProduct(productName: string): Promise<ProductPage> {
    await this.productTitleLinksWithName(productName).first().click();
    const productPage = new ProductPage(this.page);
    await productPage.expectLoaded();
    return productPage;
  }

  private productTitleLinksWithName(productName: string): Locator {
    return this.productTitleLinks.filter({ hasText: productName });
  }
}
