import { expect, test } from '@playwright/test';

// Works against the mock API and a real seeded stack: only structural assertions.

test('wine -> pairings -> wines for that food', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'I have a wine' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Wines' })).toBeVisible();

  const firstWine = page.getByRole('article').first().getByRole('link');
  const wineName = (await firstWine.textContent())!.trim();
  await firstWine.click();

  await expect(page.getByRole('heading', { level: 1, name: wineName })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Goes well with' })).toBeVisible();
  const pairings = page.getByTestId('pairing');
  await expect(pairings.first()).toBeVisible();
  await expect(pairings.first().getByRole('img', { name: /Match strength \d out of 5/ })).toBeVisible();

  await pairings.first().getByRole('link').click();
  await expect(page.getByRole('heading', { name: /^Wines that go with/ })).toBeVisible();
  await expect(page.getByTestId('pairing').first()).toBeVisible();
});

test('food -> wines -> wine detail', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'I have a dish' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Foods' })).toBeVisible();

  await page.locator('main ul a').first().click();
  await expect(page.getByRole('heading', { name: /^Wines that go with/ })).toBeVisible();
  const pairings = page.getByTestId('pairing');
  await expect(pairings.first()).toBeVisible();

  await pairings.first().getByRole('link').click();
  await expect(page.getByRole('heading', { name: 'Goes well with' })).toBeVisible();
});

test('unknown wine shows the not found state', async ({ page }) => {
  // Status stays 200 because loading.tsx streams the shell before notFound() runs.
  await page.goto('/wines/99999999');
  await expect(page.getByText('Page not found')).toBeVisible();
});

test.describe('filters and pagination (mock data)', () => {
  test.skip(!!process.env.BASE_URL, 'asserts exact mock data');

  test('filters by type and search, then clears', async ({ page }) => {
    await page.goto('/wines');
    await expect(page.getByText('30 wines found')).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(12);

    await page.getByLabel('Type').selectOption('red');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page).toHaveURL(/type=red/);
    await expect(page.getByText('8 wines found')).toBeVisible();

    await page.getByLabel('Search').fill('zzz-nothing');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByTestId('empty-state')).toContainText('No wines match your filters');

    await page.getByRole('link', { name: 'Clear filters' }).click();
    await expect(page.getByText('30 wines found')).toBeVisible();
  });

  test('paginates', async ({ page }) => {
    await page.goto('/wines');
    await page.getByRole('link', { name: 'Next' }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByRole('link', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('article').first()).toContainText('Wine 13');
  });
});
