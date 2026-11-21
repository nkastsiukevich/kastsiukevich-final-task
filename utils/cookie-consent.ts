import { Page } from '@playwright/test';

/**
 * Registers a handler that accepts the cookie banner whenever it appears,
 * so tests never have to deal with it explicitly.
 */
export async function autoAcceptCookies(page: Page): Promise<void> {
  const acceptButton = page
    .locator('#onetrust-accept-btn-handler')
    .or(page.getByRole('region', { name: /cookie consent banner/i }).getByRole('button', { name: /^accept all$/i }))
    .or(page.locator('#system-ialert-button'));
  await page.addLocatorHandler(acceptButton, async () => {
    await acceptButton.first().click({ force: true });
  });
}
