#!/usr/bin/env python3
"""
아이콘 이미지의 배경을 제거하는 스크립트

사용 방법:
1. rembg 사용 (AI 기반, 가장 정확):
   pip install rembg[new] pillow
   python scripts/remove-background.py

2. 간단한 색상 기반 제거 (빠름, 덜 정확):
   pip install pillow
   python scripts/remove-background.py --simple
"""

import os
import sys
from pathlib import Path
from PIL import Image
import numpy as np

def remove_bg_simple(img_path, output_path, threshold=240):
    """
    간단한 색상 기반 배경 제거 (흰색/밝은 배경 제거)
    """
    img = Image.open(img_path).convert("RGBA")
    data = np.array(img)
    
    # RGB 채널의 평균이 threshold 이상이면 배경으로 간주
    rgb = data[:, :, :3]
    alpha = np.mean(rgb, axis=2)
    
    # 배경을 투명하게
    mask = alpha > threshold
    data[:, :, 3] = np.where(mask, 0, 255)
    
    result = Image.fromarray(data)
    
    # 크기 최적화
    if result.size[0] > 512:
        result = result.resize((512, 512), Image.Resampling.LANCZOS)
    
    result.save(output_path, 'PNG', optimize=True)
    return True

def remove_bg_ai(img_path, output_path):
    """
    AI 기반 배경 제거 (rembg 사용)
    """
    try:
        from rembg import remove
        
        with open(img_path, 'rb') as input_file:
            input_data = input_file.read()
            output_data = remove(input_data)
        
        with open(output_path, 'wb') as f:
            f.write(output_data)
        
        # 이미지 최적화
        img = Image.open(output_path)
        if img.size[0] > 512:
            img = img.resize((512, 512), Image.Resampling.LANCZOS)
        img.save(output_path, 'PNG', optimize=True)
        
        return True
    except ImportError:
        print("❌ rembg가 설치되지 않았습니다.")
        print("   설치: pip install rembg[new] pillow")
        return False

def remove_background_from_images(input_dir, output_dir, use_ai=True):
    """
    input_dir의 모든 PNG 이미지에서 배경을 제거하여 output_dir에 저장
    """
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    
    # 출력 디렉토리 생성
    output_path.mkdir(parents=True, exist_ok=True)
    
    # PNG 파일 찾기 (no-bg 폴더 제외)
    png_files = [f for f in input_path.glob("*.png") if "no-bg" not in str(f)]
    
    if not png_files:
        print(f"❌ {input_dir}에 PNG 파일이 없습니다.")
        return
    
    print(f"📁 처리할 파일: {len(png_files)}개")
    print(f"🔧 방법: {'AI (rembg)' if use_ai else '간단한 색상 기반'}")
    print("=" * 50)
    
    success_count = 0
    for png_file in png_files:
        print(f"🔄 처리 중: {png_file.name}...", end=" ")
        
        try:
            output_file = output_path / png_file.name
            
            if use_ai:
                success = remove_bg_ai(png_file, output_file)
            else:
                success = remove_bg_simple(png_file, output_file)
            
            if success:
                print(f"✅ 완료")
                success_count += 1
            else:
                print(f"❌ 실패")
                
        except Exception as e:
            print(f"❌ 오류: {e}")
    
    print("=" * 50)
    print(f"🎉 완료: {success_count}/{len(png_files)}개 파일 처리됨")
    print(f"📂 결과 파일: {output_path}")

if __name__ == "__main__":
    # 현재 스크립트 위치 기준으로 경로 설정
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    input_dir = project_root / "public" / "icon"
    output_dir = project_root / "public" / "icon" / "no-bg"
    
    # 간단한 모드 체크
    use_ai = "--simple" not in sys.argv
    
    print("=" * 50)
    print("🎨 아이콘 배경 제거 스크립트")
    print("=" * 50)
    print(f"입력 디렉토리: {input_dir}")
    print(f"출력 디렉토리: {output_dir}")
    print("=" * 50)
    
    if not input_dir.exists():
        print(f"❌ 입력 디렉토리가 없습니다: {input_dir}")
        exit(1)
    
    remove_background_from_images(input_dir, output_dir, use_ai=use_ai)
    
    if use_ai:
        print("\n💡 팁: 결과가 만족스럽지 않으면 --simple 옵션으로 시도해보세요:")
        print("   python scripts/remove-background.py --simple")

