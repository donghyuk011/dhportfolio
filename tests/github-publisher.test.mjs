import assert from "node:assert/strict";
import test from "node:test";
import { publishPortfolio } from "../src/lib/githubPublisher.js";

test("작품 이미지와 JSON을 하나의 GitHub 커밋으로 게시한다", async () => {
  const calls = [];
  const originalFetch = global.fetch;
  global.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.endsWith("/git/ref/heads/main")) return Response.json({ object: { sha: "head-sha" } });
    if (url.endsWith("/git/commits/head-sha")) return Response.json({ tree: { sha: "base-tree" } });
    if (url.endsWith("/git/blobs")) return Response.json({ sha: `blob-${calls.length}` });
    if (url.endsWith("/git/trees")) return Response.json({ sha: "next-tree" });
    if (url.endsWith("/git/commits")) return Response.json({ sha: "next-commit" });
    if (url.endsWith("/git/refs/heads/main")) return Response.json({ object: { sha: "next-commit" } });
    return new Response("not found", { status: 404 });
  };

  try {
    const result = await publishPortfolio([{
      id: "12345678-abcd",
      slug: "sample-project",
      title: "샘플 작품",
      thumbnail: "data:image/png;base64,aGVsbG8=",
      images: [{ src: "data:image/webp;base64,d29ybGQ=", alt: "상세" }],
    }], "github_pat_test");

    assert.match(result[0].thumbnail, /^uploads\/sample-project-12345678-cover\.png$/);
    assert.match(result[0].images[0].src, /^uploads\/sample-project-12345678-1\.webp$/);
    const treeRequest = calls.find((call) => call.url.endsWith("/git/trees"));
    const paths = JSON.parse(treeRequest.options.body).tree.map((item) => item.path);
    assert.deepEqual(paths, [
      "public/uploads/sample-project-12345678-cover.png",
      "public/uploads/sample-project-12345678-1.webp",
      "public/portfolio-data.json",
    ]);
    const refUpdate = calls.find((call) => call.options.method === "PATCH");
    assert.deepEqual(JSON.parse(refUpdate.options.body), { sha: "next-commit", force: false });
  } finally {
    global.fetch = originalFetch;
  }
});
