import { test, expect } from "@playwright/test";

const user = `tripuser_${Date.now()}`;

test.describe("Trips", () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto("/register");
    await page.fill('input[name="username"]', user);
    await page.fill('input[name="password"]', "test1234");
    await page.fill('input[name="confirm"]', "test1234");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/login/);
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="username"]', user);
    await page.fill('input[name="password"]', "test1234");
    await page.click('button[type="submit"]');
    await page.waitForURL("/");
  });

  test("create trip and see it on dashboard", async ({ page }) => {
    await page.click('a[href="/trips/new"]');
    await page.fill('input[name="name"]', "Thailand Trip");
    await page.fill('input[name="destination"]', "Bangkok");
    await page.fill('input[name="endDate"]', "2026-07-15");
    await page.click('button[type="submit"]');

    await expect(page.locator("h1:has-text('Thailand Trip')")).toBeVisible();

    await page.click('a[href="/"]');
    await expect(page.locator("text=Thailand Trip")).toBeVisible();
    await expect(page.locator("text=Bangkok")).toBeVisible();
  });

  test("edit trip details", async ({ page }) => {
    await page.click("text=Thailand Trip");
    await page.click("text=Edit Trip");

    await page.fill('input[name="destination"]', "Phuket");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Phuket")).toBeVisible();
  });

  test("delete trip", async ({ page }) => {
    await page.click('a[href="/trips/new"]');
    await page.fill('input[name="name"]', "Temp Trip");
    await page.fill('input[name="destination"]', "Nowhere");
    await page.click('button[type="submit"]');

    await page.click("text=Edit Trip");

    page.on("dialog", (dialog) => dialog.accept());
    await page.click("text=Delete Trip");

    await expect(page).toHaveURL("/");
    await expect(page.locator("text=Temp Trip")).not.toBeVisible();
  });
});
