import { test as base } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { JobSearchPage } from '../pages/job-search.page';
import { autoAcceptCookies } from '../utils/cookie-consent';

type PageFixtures = {
  homePage: HomePage;
  jobSearchPage: JobSearchPage;
};

export const test = base.extend<PageFixtures>({
  page: async ({ page }, use) => {
    await autoAcceptCookies(page);
    // The jobs portal opens in a new tab, which needs the same cookie handling.
    page.context().on('page', (newPage) => void autoAcceptCookies(newPage));
    await use(page);
  },

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await homePage.expectLoaded();
    await use(homePage);
  },

  jobSearchPage: async ({ homePage }, use) => {
    const careersPage = await homePage.goToJobs();
    const jobSearchPage = await careersPage.openJobSearch();
    await use(jobSearchPage);
  },
});

export { expect } from '@playwright/test';
