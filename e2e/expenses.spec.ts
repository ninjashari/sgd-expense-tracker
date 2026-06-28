import { test, expect } from "@playwright/test";

const user = `expuser_${Date.now()}`;
let tripUrl: string;

test.describe("Expenses", () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto("/register");
    await page.fill('input[name="username"]', user);
    await page.fill('input[name="password"]', "test1234");
    await page.fill('input[name="confirm"]', "test1234");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/login/);

    await page.fill('input[name="username"]', user);
    await page.fill('input[name="password"]', "test1234");
    await page.click('button[type="submit"]');
    await page.waitForURL("/");

    await page.click('a[href="/trips/new"]');
    await page.fill('input[name="name"]', "Expense Test Trip");
    await page.fill('input[name="destination"]', "Tokyo");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/trips\//);
    tripUrl = page.url();
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="username"]', user);
    await page.fill('input[name="password"]', "test1234");
    await page.click('button[type="submit"]');
    await page.waitForURL("/");
    await page.goto(tripUrl);
  });

  test("add paid expense", async ({ page }) => {
    await page.click('a:has-text("Add")');

    await page.fill('input[name="description"]', "Sushi Dinner");
    await page.fill('input[name="amount"]', "5000");

    // Click "paid" status
    const paidBtn = page.locator("button", { hasText: /^paid$/ });
    await paidBtn.click();

    await page.click('button[type="submit"]');

    await expect(page.locator("text=Sushi Dinner")).toBeVisible();
    await expect(page.locator("text=₹5000.00")).toBeVisible();
  });

  test("date restrictions for paid expense", async ({ page }) => {
    await page.click('a:has-text("Add")');

    const paidBtn = page.locator("button", { hasText: /^paid$/ });
    await paidBtn.click();

    const dateInput = page.locator('input[name="date"]');
    const max = await dateInput.getAttribute("max");
    const today = new Date().toISOString().split("T")[0];
    expect(max).toBe(today);
  });

  test("date restrictions for planned expense", async ({ page }) => {
    await page.click('a:has-text("Add")');

    const plannedBtn = page.locator("button", { hasText: /^planned$/ });
    await plannedBtn.click();

    const dateInput = page.locator('input[name="date"]');
    const min = await dateInput.getAttribute("min");
    const max = await dateInput.getAttribute("max");

    const today = new Date().toISOString().split("T")[0];
    const future = new Date();
    future.setMonth(future.getMonth() + 2);
    const futureStr = future.toISOString().split("T")[0];

    expect(min).toBe(today);
    expect(max).toBe(futureStr);
  });

  test("edit expense", async ({ page }) => {
    await page.click("text=Sushi Dinner");
    await page.fill('input[name="description"]', "Ramen Dinner");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Ramen Dinner")).toBeVisible();
  });

  test("delete expense", async ({ page }) => {
    page.on("dialog", (dialog) => dialog.accept());
    await page.click("text=Ramen Dinner");
    await page.click("text=Delete");

    await expect(page.locator("text=Ramen Dinner")).not.toBeVisible();
  });
});
