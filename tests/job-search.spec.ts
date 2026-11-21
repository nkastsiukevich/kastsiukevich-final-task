import { test } from '../fixtures/pages.fixture';
import { JobDetailsPage } from '../pages/job-details.page';
import { JobSearchPage } from '../pages/job-search.page';
import { jobSearchData } from '../test-data/jobs.data';

/**
 * Scenario 1, steps 4-7: search for the primary term, fall back to the next term on 0 results,
 * and open the first job. Returns the title the job is expected to contain.
 */
async function searchAndOpenFirstJob(
  jobSearchPage: JobSearchPage,
): Promise<{ expectedTitle: string; jobDetailsPage: JobDetailsPage }> {
  const usedTerm = await test.step(`Search for "${jobSearchData.primaryTerm}" with fallback on 0 results`, () =>
    jobSearchPage.searchWithFallback([jobSearchData.primaryTerm, ...jobSearchData.fallbackTerms]),
  );

  if (usedTerm !== jobSearchData.primaryTerm) {
    // Step 6 allows the fallback; make it visible in the report instead of silently changing the check.
    test.info().annotations.push({
      type: 'fallback',
      description: `No jobs for "${jobSearchData.primaryTerm}", searched for "${usedTerm}" instead (scenario step 6).`,
    });
  }

  const jobDetailsPage = await test.step('Open the first job in the list', () => jobSearchPage.openFirstResult());
  return { expectedTitle: usedTerm, jobDetailsPage };
}

test.describe('IKEA Jobs: search', () => {
  test('first found job has the searched title', async ({ jobSearchPage }) => {
    const { expectedTitle, jobDetailsPage } = await searchAndOpenFirstJob(jobSearchPage);

    await test.step(`Check that the job title contains "${expectedTitle}"`, () =>
      jobDetailsPage.expectTitleContains(expectedTitle),
    );
  });

  // Known gap: the current IKEA Jobs portal has no Save control on job pages, so steps 9-12 cannot run.
  // Marked as fixme on purpose (agreed exception) instead of a runtime skip. Remove fixme once the feature exists.
  test.fixme('saved job appears in Saved jobs', async ({ jobSearchPage }) => {
    const { expectedTitle, jobDetailsPage } = await searchAndOpenFirstJob(jobSearchPage);

    await test.step('Save the job and check the Saved jobs counter', async () => {
      await jobDetailsPage.saveJob();
      await jobDetailsPage.portalHeader.expectSavedJobsCount(1);
    });

    await test.step('Open Saved jobs and check the saved job title', async () => {
      const savedJobsPage = await jobDetailsPage.portalHeader.openSavedJobs();
      await savedJobsPage.expectSingleSavedJobWithTitle(expectedTitle);
    });
  });
});
