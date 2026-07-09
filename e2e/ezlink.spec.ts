import { test, expect } from "@playwright/test";

const user = `ezuser_${Date.now()}`;
let sgdTripUrl: string;
let inrTripUrl: string;

test.describe("EZ-Link", () => {
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

    // SGD trip (EZ-Link should be available)
    await page.click('a[href="/trips/new"]');
    await page.fill('input[name="name"]', "Singapore Trip");
    await page.fill('input[name="destination"]', "Singapore");
    await page.selectOption('select[name="foreignCurrency"]', "SGD");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/trips\/(?!new)[\w-]+$/);
    sgdTripUrl = page.url();

    // INR-only trip (EZ-Link should NOT be available)
    await page.goto("/trips/new");
    await page.fill('input[name="name"]', "Domestic Trip");
    await page.fill('input[name="destination"]', "Goa");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/trips\/(?!new)[\w-]+$/);
    inrTripUrl = page.url();

    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="username"]', user);
    await page.fill('input[name="password"]', "test1234");
    await page.click('button[type="submit"]');
    await page.waitForURL("/");
  });

  test("EZ-Link tab only shows for SGD trips", async ({ page }) => {
    await page.goto(sgdTripUrl);
    await expect(page.locator("text=EZ-Link")).toBeVisible();

    await page.goto(inrTripUrl);
    await expect(page.locator("text=EZ-Link")).not.toBeVisible();
  });

  test("top up does not count toward trip total, spend does", async ({
    page,
  }) => {
    await page.goto(sgdTripUrl);
    await page.click('a:has-text("EZ-Link")');
    await page.waitForURL(/view=ezlink/);
    await expect(page.locator("text=No EZ-Link transactions yet")).toBeVisible();

    // Top up S$50 for ₹2350 (rate = 47)
    await page.click('a:has-text("Top Up")');
    await page.fill('input[name="amountSgd"]', "50");
    await page.fill('input[name="amountInr"]', "2350");
    await page.click('button[type="submit"]');
    await page.waitForURL(/view=ezlink/);

    await expect(page.locator("text=S$50.00").first()).toBeVisible();
    await expect(page.locator("text=EZ-Link Top Up")).toBeVisible();

    // Top-up must NOT count toward the trip's Paid/Total summary
    await expect(page.locator("text=₹0.00").first()).toBeVisible();

    // Log a S$2 spend under Transport
    await page.click('a:has-text("Log Spend")');
    await page.fill('input[name="amountSgd"]', "2");
    await page.click('button:has-text("Transport")');
    await page.click('button[type="submit"]');
    await page.waitForURL(/view=ezlink/);

    // Balance should drop to S$48.00
    await expect(page.locator("text=S$48.00")).toBeVisible();
    await expect(page.locator("text=Transport").first()).toBeVisible();

    // Spend (2 SGD * 47 rate = ₹94) must now count toward the trip total
    await expect(page.locator("text=₹94.00").first()).toBeVisible();
  });

  test("rejects spending more than the card balance", async ({ page }) => {
    await page.goto(`${sgdTripUrl}?view=ezlink`);
    await page.click('a:has-text("Log Spend")');
    await page.fill('input[name="amountSgd"]', "1000");
    await page.click('button:has-text("Transport")');
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Insufficient EZ-Link balance")).toBeVisible();
  });

  test("edit and delete an EZ-Link spend", async ({ page }) => {
    await page.goto(`${sgdTripUrl}?view=ezlink`);

    // Edit the S$2 Transport spend up to S$3
    await page.click("text=Transport");
    await page.fill('input[name="amountSgd"]', "3");
    await page.click('button:has-text("Update Spend")');
    await page.waitForURL(/view=ezlink/);

    await expect(page.locator("text=S$47.00")).toBeVisible();

    // Delete it
    page.on("dialog", (dialog) => dialog.accept());
    await page.click("text=Transport");
    await page.click("text=Delete");
    await page.waitForURL(/view=ezlink/);

    await expect(page.locator("text=S$50.00").first()).toBeVisible();
    await expect(page.locator("text=₹0.00").first()).toBeVisible();
  });

  test("deleting the trip removes EZ-Link data without error", async ({
    page,
  }) => {
    await page.goto(sgdTripUrl);
    await page.click("text=Edit Trip");
    page.on("dialog", (dialog) => dialog.accept());
    await page.click("text=Delete Trip");
    await page.waitForURL("/");
  });
});
