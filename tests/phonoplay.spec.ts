import { test, expect } from "@playwright/test";

test.describe("PhonoPlay pages", () => {
  test("home page loads", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
  });

  test("about page loads", async ({ page }) => {
    const response = await page.goto("/about");

    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
  });

  test("settings page loads", async ({ page }) => {
    const response = await page.goto("/settings");

    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
  });

  test("Wordle builder loads", async ({ page }) => {
    const response = await page.goto("/wordle");

    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
  });

  test("Word Search builder loads", async ({ page }) => {
    const response = await page.goto("/word-search");

    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
  });

  test("analytics dashboard loads", async ({ page }) => {
    const response = await page.goto("/dashboard");

    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("PhonoPlay API", () => {
  test("health endpoint returns healthy status", async ({ request }) => {
    const response = await request.get("/health");

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  test("analytics endpoint returns metrics", async ({ request }) => {
    const response = await request.get("/api/analytics");

    expect(response.status()).toBe(200);

    const data = await response.json();

    expect(data).toHaveProperty("metrics");
    expect(data).toHaveProperty("recentGenerations");
  });
});
