import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://yjkzhaiuomzrzaffycnl.supabase.co/rest/v1/projects**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "content-range": "0-0/0" },
      body: "[]",
    });
  });
});

test("빈 포트폴리오, 한국어 화면과 연락처가 정확히 표시된다", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("./");
  await expect(page).toHaveTitle("동혁 . 포트폴리오 — 사이버보안 / 네트워크");
  await expect(page.getByRole("heading", { name: "포트폴리오." })).toBeVisible();
  await expect(page.getByText("아직 업로드된 작품이 없습니다.").first()).toBeVisible();
  await expect(page.locator(".project-row")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "김동혁" })).toBeAttached();
  await expect(page.getByRole("link", { name: /gimd50236@gmail.com/ })).toHaveAttribute("href", "mailto:gimd50236@gmail.com");
  await expect(page.getByRole("link", { name: /010-4109-6552/ })).toHaveAttribute("href", "tel:01041096552");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("작품 관리는 이메일 요청과 토큰 없이 비밀번호 로그인을 사용한다", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "작품 업로드 ＋" }).click();
  const dialog = page.getByRole("dialog", { name: "작품 관리" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "비밀번호로 관리자 로그인" })).toBeVisible();
  await expect(dialog.getByLabel("아이디")).toHaveAttribute("placeholder", "donghyuk011");
  await expect(dialog.getByText("힌트: 깃허브 아이디")).toBeVisible();
  await expect(dialog.getByLabel("비밀번호")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "관리자 로그인 →" })).toBeDisabled();
  await expect(dialog.getByText(/로그인 링크 받기/)).toHaveCount(0);
  await expect(dialog.getByText(/GitHub 저장소 토큰/)).toHaveCount(0);
});

test("모바일 메뉴와 관리자 로그인 화면이 작은 화면에 맞게 표시된다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await expect(page.getByRole("navigation", { name: "모바일 빠른 메뉴" })).toBeVisible();
  await page.getByRole("button", { name: "메뉴 +" }).click();
  await expect(page.getByRole("button", { name: "작품 관리 ＋" })).toBeVisible();
  await page.getByRole("button", { name: "작품 관리 ＋" }).click();
  await expect(page.getByRole("heading", { name: "비밀번호로 관리자 로그인" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
