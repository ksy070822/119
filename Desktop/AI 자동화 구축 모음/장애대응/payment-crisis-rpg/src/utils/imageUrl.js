/**
 * 한글 등이 포함된 이미지 경로를 브라우저에서 로드할 수 있도록 인코딩
 */
export function getImageUrl(path) {
  if (!path) return '';
  try {
    return encodeURI(path);
  } catch {
    return path;
  }
}
