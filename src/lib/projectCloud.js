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

export function validatePdfFile(file) {
  if (!file) return;
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name || "");
  if (!isPdf) throw new Error("PDF 파일만 올릴 수 있습니다.");
  if (file.size > 25 * 1024 * 1024) throw new Error("PDF는 25MB 이하로 선택해 주세요.");
}
