import { test, expect } from "@playwright/test";

const uniqueUser = `e2euser_${Date.now()}`;

test.describe("Authentication", () => {
  test("register, redirect to login, sign in", async ({ page }) => {
    await page.goto("/register");
    await page.fill('input[name="username"]', uniqueUser);
    await page.fill('input[name="password"]', "test1234");
    await page.fill('input[name="confirm"]', "test1234");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/login\?registered=1/);
    await expect(
      page.locator("text=Account created! Please sign in.")
    ).toBeVisible();

    await page.fill('input[name="username"]', uniqueUser);
    await page.fill('input[name="password"]', "test1234");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/");
    await expect(page.locator("text=TripKharcha")).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="username"]', "nonexistent");
    await page.fill('input[name="password"]', "wrongpass");
    await page.click('button[type="submit"]');

    await expect(
      page.locator("text=Invalid username or password")
    ).toBeVisible();
  });

  test("protected routes redirect to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("registration validates password length", async ({ page }) => {
    await page.goto("/register");
    await page.fill('input[name="username"]', "shortpw");
    await page.fill('input[name="password"]', "12345");
    await page.fill('input[name="confirm"]', "12345");
    await page.click('button[type="submit"]');

    await expect(
      page.locator("text=Password must be at least 6 characters")
    ).toBeVisible();
  });
});
