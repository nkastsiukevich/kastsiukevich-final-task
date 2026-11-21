import { expect, Locator, Page } from "@playwright/test";

export interface JobAlertSubscription {
  email: string;
  category: string;
  location: string;
}

/** Job-alert form on the official IKEA jobs portal. */
export class JobAlertComponent {
  readonly emailInput: Locator;
  readonly categorySelect: Locator;
  readonly locationInput: Locator;
  readonly addJobAlertButton: Locator;
  readonly signUpButton: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByRole("textbox", { name: /^Email\*?$/i });
    this.categorySelect = page.getByRole("combobox", { name: "Category" });
    this.locationInput = page.getByRole("combobox", { name: /location/i });
    // Visible text is "Add", the accessible name is "Add Job Alert".
    this.addJobAlertButton = page.getByRole("button", {
      name: "Add Job Alert",
    });
    this.signUpButton = page.getByRole("button", { name: /^sign up$/i });
  }

  async subscribe({
    email,
    category,
    location,
  }: JobAlertSubscription): Promise<void> {
    // The portal re-renders after the delayed cookie banner is accepted, which clears the form.
    // toPass() refills the form from scratch until it is complete on a stable page.
    await expect(async () => {
      await this.emailInput.fill(email);
      await this.categorySelect.selectOption({ label: category });
      await this.locationInput.fill("");
      // Autocomplete reacts to key presses, so the location is typed instead of pasted with fill().
      await this.locationInput.pressSequentially(location, { delay: 100 });
      await this.locationOption(location).click({ timeout: 5_000 });

      // If the page re-rendered in between, these checks fail and the whole block is repeated.
      await expect(this.emailInput).toHaveValue(email, { timeout: 2_000 });
      await expect(this.categorySelect.locator("option:checked")).toHaveText(
        category,
        { timeout: 2_000 },
      );
      await expect(this.addJobAlertButton).toBeEnabled({ timeout: 2_000 });
    }).toPass({ timeout: 45_000 });

    await this.addJobAlertButton.click();
    // Input values are not part of page text, so visible text here means the location was added to the alert.
    await expect(
      this.page.getByRole("main").getByText(location).first(),
    ).toBeVisible();
    await expect(this.emailInput).toHaveValue(email);

    await this.signUpButton.click();
  }

  /** The portal shows the confirmation as a paragraph with a Close button under the form. */
  async expectConfirmation(text: RegExp): Promise<void> {
    const confirmation = this.page
      .getByRole("main")
      .getByRole("paragraph")
      .filter({ hasText: text });
    await expect(confirmation).toBeVisible();
  }

  private locationOption(location: string): Locator {
    return this.page.getByRole("option").filter({ hasText: location }).first();
  }
}
