const repository = {
  owner: "donghyuk011",
  name: "dhportfolio",
  branch: "main",
};

const apiRoot = `https://api.github.com/repos/${repository.owner}/${repository.name}`;

async function request(path, token, options = {}) {
  const response = await fetch(`${apiRoot}${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error("GitHub 토큰을 확인해 주세요.");
    if (response.status === 403) throw new Error("토큰에 이 저장소의 Contents 읽기·쓰기 권한이 필요합니다.");
    throw new Error(body.message || `GitHub 게시 중 오류가 발생했습니다. (${response.status})`);
  }

  return response.status === 204 ? null : response.json();
}

function extensionFor(mimeType) {
  return {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
  }[mimeType] || "webp";
}

function dataUrlParts(value) {
  const match = /^data:([^;,]+);base64,(.+)$/.exec(value || "");
  return match ? { mimeType: match[1], base64: match[2] } : null;
}

async function createBlob(content, token, encoding = "base64") {
  const blob = await request("/git/blobs", token, {
    method: "POST",
    body: JSON.stringify({ content, encoding }),
  });
  return blob.sha;
}

function jsonToBase64(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value, null, 2));
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function safeName(value) {
  return value.replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "project";
}

export async function publishPortfolio(projects, token, onProgress = () => {}) {
  const cleanToken = token.trim();
  if (!cleanToken) throw new Error("GitHub 토큰을 입력해 주세요.");

  onProgress("GitHub 저장소를 확인하고 있습니다…");
  const reference = await request(`/git/ref/heads/${repository.branch}`, cleanToken);
  const headCommit = await request(`/git/commits/${reference.object.sha}`, cleanToken);
  const tree = [];
  const publishedProjects = [];

  for (let projectIndex = 0; projectIndex < projects.length; projectIndex += 1) {
    const project = projects[projectIndex];
    const prefix = `${safeName(project.slug || project.title)}-${String(project.id || projectIndex).slice(0, 8)}`;
    onProgress(`이미지를 준비하고 있습니다… (${projectIndex + 1}/${projects.length})`);

    let thumbnail = project.thumbnail;
    const cover = dataUrlParts(project.thumbnail);
    if (cover) {
      const filename = `${prefix}-cover.${extensionFor(cover.mimeType)}`;
      tree.push({ path: `public/uploads/${filename}`, mode: "100644", type: "blob", sha: await createBlob(cover.base64, cleanToken) });
      thumbnail = `uploads/${filename}`;
    }

    const images = [];
    for (let imageIndex = 0; imageIndex < (project.images || []).length; imageIndex += 1) {
      const image = project.images[imageIndex];
      const parts = dataUrlParts(image.src);
      if (!parts) {
        images.push(image);
        continue;
      }
      const filename = `${prefix}-${imageIndex + 1}.${extensionFor(parts.mimeType)}`;
      tree.push({ path: `public/uploads/${filename}`, mode: "100644", type: "blob", sha: await createBlob(parts.base64, cleanToken) });
      images.push({ ...image, src: `uploads/${filename}` });
    }

    publishedProjects.push({ ...project, thumbnail, images });
  }

  onProgress("작품 정보를 게시하고 있습니다…");
  tree.push({
    path: "public/portfolio-data.json",
    mode: "100644",
    type: "blob",
    sha: await createBlob(jsonToBase64(publishedProjects), cleanToken),
  });

  const nextTree = await request("/git/trees", cleanToken, {
    method: "POST",
    body: JSON.stringify({ base_tree: headCommit.tree.sha, tree }),
  });
  const nextCommit = await request("/git/commits", cleanToken, {
    method: "POST",
    body: JSON.stringify({
      message: `포트폴리오 작품 ${publishedProjects.length}개 게시`,
      tree: nextTree.sha,
      parents: [reference.object.sha],
    }),
  });
  await request(`/git/refs/heads/${repository.branch}`, cleanToken, {
    method: "PATCH",
    body: JSON.stringify({ sha: nextCommit.sha, force: false }),
  });

  return publishedProjects;
}

export const githubRepositoryUrl = `https://github.com/${repository.owner}/${repository.name}`;
