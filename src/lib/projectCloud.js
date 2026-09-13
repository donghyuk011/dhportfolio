export function extensionFor(mimeType) {
  return {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
  }[mimeType] || "webp";
}

export function rowsToProjects(rows = []) {
  return rows.map((row) => ({ ...row.content, id: row.id }));
}
