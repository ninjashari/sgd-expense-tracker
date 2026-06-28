import { test, expect } from "@playwright/test";

const user = `catuser_${Date.now()}`;

test.describe("Categories", () => {
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

  test("default categories exist after registration", async ({ page }) => {
    await page.click('a[href="/categories"]');

    await expect(page.locator("text=Food & Drink")).toBeVisible();
    await expect(page.locator("text=Transport")).toBeVisible();
    await expect(page.locator("text=Accommodation")).toBeVisible();
    await expect(page.locator("text=Shopping")).toBeVisible();
    await expect(page.locator("text=Attractions")).toBeVisible();
    await expect(page.locator("text=Other")).toBeVisible();
  });

  test("add new category", async ({ page }) => {
    await page.click('a[href="/categories"]');
    await page.click('a[href="/categories/add"]');

    await page.fill('input[name="name"]', "Nightlife");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Nightlife")).toBeVisible();
  });

  test("edit category", async ({ page }) => {
    await page.click('a[href="/categories"]');
    await page.click("text=Nightlife");

    await page.fill('input[name="name"]', "Entertainment");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Entertainment")).toBeVisible();
  });

  test("delete unused category", async ({ page }) => {
    await page.click('a[href="/categories"]');
    await page.click("text=Entertainment");

    page.on("dialog", (dialog) => dialog.accept());
    await page.click("text=Delete");

    await expect(page.locator("text=Entertainment")).not.toBeVisible();
  });
});
