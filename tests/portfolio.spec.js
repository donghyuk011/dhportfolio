import path from "node:path";
import { test, expect } from "@playwright/test";

const coverPath = path.resolve("public/images/projects/common.svg");

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

test("작품을 업로드하면 카드와 상세 페이지가 생기고 새로고침 후에도 유지된다", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "작품 업로드 ＋" }).click();
  await expect(page.getByRole("dialog", { name: "작품 관리" })).toBeVisible();
  await page.locator("#project-cover").setInputFiles(coverPath);
  await page.getByLabel(/작품 이름/).fill("동네 연결 앱");
  await page.getByLabel("분야").fill("UI/UX 디자인");
  await page.getByLabel("연도").fill("2026");
  await page.getByLabel("역할").fill("프로덕트 디자이너");
  await page.getByLabel("작업 기간").fill("8주");
  await page.getByLabel("사용 도구").fill("Figma, React");
  await page.getByLabel(/한 줄 소개/).fill("이웃과 가까워지는 새로운 방법입니다.");
  await page.getByLabel("프로젝트 개요").fill("지역의 작은 모임을 쉽게 발견하는 서비스입니다.");
  await page.getByRole("button", { name: "작품 저장하기" }).click();
  await expect(page.getByText(/작품을 저장했습니다/)).toBeVisible();
  await expect(page.getByText("동네 연결 앱").first()).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "백업 파일 받기 ↓" }).click();
  expect((await download).suggestedFilename()).toBe("portfolio-data.json");
  await page.getByRole("button", { name: "작품 관리 닫기" }).click();
  await expect(page.getByRole("link", { name: "동네 연결 앱 작품 보기" })).toBeVisible();
  await expect(page.locator(".project-row")).toHaveCount(1);
  await page.getByRole("link", { name: "동네 연결 앱 작품 보기" }).click();
  await expect(page.getByRole("heading", { name: "동네 연결 앱." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "개요" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "동네 연결 앱." })).toBeVisible();
  await expect(page.locator(".detail-cover img")).toHaveJSProperty("complete", true);
});

test("작품 삭제와 모바일 메뉴가 정상 작동한다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await expect(page.getByRole("navigation", { name: "모바일 빠른 메뉴" })).toBeVisible();
  await page.getByRole("button", { name: "메뉴 +" }).click();
  await expect(page.getByRole("button", { name: "작품 관리 ＋" })).toBeVisible();
  await page.getByRole("button", { name: "작품 관리 ＋" }).click();
  await page.locator("#project-cover").setInputFiles(coverPath);
  await page.getByLabel(/작품 이름/).fill("삭제할 작품");
  await page.getByLabel(/한 줄 소개/).fill("삭제 기능을 확인하는 작품입니다.");
  await page.getByRole("button", { name: "작품 저장하기" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "삭제" }).click();
  await expect(page.getByText("저장된 작품")).toHaveCount(0);
  await page.getByRole("button", { name: "작품 관리 닫기" }).click();
  await expect(page.getByText("아직 업로드된 작품이 없습니다.").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
