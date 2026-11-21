import { expect, Locator, Page } from '@playwright/test';
import { HeaderComponent } from './components/header.component';

export class ProductPage {
  readonly header: HeaderComponent;
  readonly productName: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.productName = page.getByRole('heading', { level: 1 });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.productName).toBeVisible();
  }

  async expectNameContains(text: string): Promise<void> {
    await expect(this.productName).toContainText(text, { ignoreCase: true });
  }
}
