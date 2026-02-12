#!/usr/bin/env python3
"""
CCO 이미지 배경 제거 스크립트
rembg 라이브러리를 사용하여 JPEG의 배경을 제거하고 투명 PNG로 변환
"""
import os
from pathlib import Path

try:
    from rembg import remove
    from PIL import Image
except ImportError:
    print("❌ 필요한 라이브러리가 설치되지 않았습니다.")
    print("다음 명령어로 설치하세요:")
    print("  pip install rembg pillow")
    exit(1)

# 파일 경로
base_dir = Path(__file__).parent.parent
guardians_dir = base_dir / "public" / "assets" / "characters" / "guardians"

files_to_process = [
    ("cco_idle.png", "cco_idle_transparent.png"),
    ("cco_portrait.png", "cco_portrait_transparent.png"),
]

print("🎨 CCO 이미지 배경 제거 시작...\n")

for input_file, output_file in files_to_process:
    input_path = guardians_dir / input_file
    output_path = guardians_dir / output_file

    if not input_path.exists():
        print(f"⚠️  {input_file} 파일을 찾을 수 없습니다.")
        continue

    print(f"처리 중: {input_file}")

    # 이미지 로드
    with Image.open(input_path) as img:
        # 배경 제거
        output_img = remove(img)

        # PNG로 저장
        output_img.save(output_path, "PNG")

        print(f"✅ 생성 완료: {output_file}")
        print(f"   크기: {output_img.width}x{output_img.height}")
        print()

print("=" * 50)
print("✅ 모든 이미지 처리 완료!")
print("\n다음 단계:")
print("1. 생성된 *_transparent.png 파일을 확인하세요")
print("2. 만족스러우면 원본 파일을 교체하세요:")
print("   mv guardians/cco_idle_transparent.png guardians/cco_idle.png")
print("   mv guardians/cco_portrait_transparent.png guardians/cco_portrait.png")
