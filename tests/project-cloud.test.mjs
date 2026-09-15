import test from "node:test";
import assert from "node:assert/strict";
import { extensionFor, rowsToProjects, validatePdfFile } from "../src/lib/projectCloud.js";

test("Supabase 행을 화면에 쓰는 프로젝트 형태로 복원한다", () => {
  const projects = rowsToProjects([
    { id: "server-id", content: { id: "stale-id", title: "공유 작품", images: [] } },
  ]);
  assert.deepEqual(projects, [{ id: "server-id", title: "공유 작품", images: [] }]);
});

test("업로드 이미지 형식에 맞는 확장자를 선택한다", () => {
  assert.equal(extensionFor("image/jpeg"), "jpg");
  assert.equal(extensionFor("image/svg+xml"), "svg");
  assert.equal(extensionFor("application/octet-stream"), "webp");
});

test("PDF 형식과 25MB 제한을 검사한다", () => {
  assert.doesNotThrow(() => validatePdfFile({ name: "portfolio.pdf", type: "application/pdf", size: 1024 }));
  assert.throws(() => validatePdfFile({ name: "portfolio.zip", type: "application/zip", size: 1024 }), /PDF 파일만/);
  assert.throws(() => validatePdfFile({ name: "large.pdf", type: "application/pdf", size: 26 * 1024 * 1024 }), /25MB 이하/);
});
