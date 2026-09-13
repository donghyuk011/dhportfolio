import test from "node:test";
import assert from "node:assert/strict";
import { extensionFor, rowsToProjects } from "../src/lib/projectCloud.js";

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
