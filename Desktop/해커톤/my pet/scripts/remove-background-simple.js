/**
 * 간단한 배경 제거 방법 (온라인 도구 사용 가이드)
 * 
 * Python rembg가 설치되지 않은 경우, 다음 온라인 도구를 사용하세요:
 * 
 * 1. Remove.bg (https://www.remove.bg/)
 *    - 무료: 월 50장까지
 *    - API 키 필요 없이 웹에서 직접 사용 가능
 * 
 * 2. Photopea (https://www.photopea.com/)
 *    - 무료 온라인 Photoshop
 *    - Magic Wand 도구로 배경 선택 후 삭제
 * 
 * 3. Canva (https://www.canva.com/)
 *    - 배경 제거 기능 내장
 * 
 * 4. ImageMagick (명령줄 도구)
 *    설치: brew install imagemagick (macOS)
 *    사용:
 *      convert input.png -fuzz 10% -transparent white output.png
 */

console.log(`
📝 배경 제거 방법:

방법 1: 온라인 도구 사용 (가장 쉬움)
1. https://www.remove.bg/ 접속
2. 각 아이콘 이미지 업로드
3. 다운로드 후 public/icon/ 폴더에 덮어쓰기

방법 2: Python 스크립트 사용
1. pip install rembg pillow
2. node scripts/remove-background-simple.js (이 파일은 가이드용)
   또는 python scripts/remove-background.py

방법 3: ImageMagick 사용 (명령줄)
brew install imagemagick
for file in public/icon/*.png; do
  convert "$file" -fuzz 10% -transparent white "${file%.png}_no_bg.png"
done
`);


