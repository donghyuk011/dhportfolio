// 정적 배포 이미지와 업로드된 data URL을 같은 방식으로 처리합니다.
export function assetUrl(path = "") {
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}
