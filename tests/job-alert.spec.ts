import { test } from '../fixtures/pages.fixture';
import { jobAlertData } from '../test-data/jobs.data';
import { generateUniqueEmail } from '../utils/data-generator';

test.describe('IKEA Jobs: job alert', () => {
  test('user can subscribe to a job alert with a new email', async ({ jobSearchPage }) => {
    // A fresh address on every run avoids "already subscribed" conflicts.
    await test.step('Fill in email, category and location and sign up', () =>
      jobSearchPage.jobAlert.subscribe({
        email: generateUniqueEmail(),
        category: jobAlertData.category,
        location: jobAlertData.location,
      }),
    );

    await test.step('Check the confirmation message', () =>
      jobSearchPage.jobAlert.expectConfirmation(jobAlertData.confirmationText),
    );
  });
});
