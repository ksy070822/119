# 디지털 트윈 아바타 레이어 구조

이 폴더에는 디지털 트윈 아바타를 위한 PNG 레이어 이미지들이 들어갑니다.

## 폴더 구조

```
assets/avatar/
├── dog/
│   ├── base.png              # 강아지 기본 캐릭터
│   ├── ears_poodle.png       # 푸들 귀
│   ├── ears_shiba.png        # 시바 귀
│   ├── ears_chihuahua.png    # 치와와 귀
│   └── ...
├── cat/
│   ├── base.png              # 고양이 기본 캐릭터
│   ├── ears_korean.png       # 코리안 숏헤어 귀
│   ├── ears_scottish.png     # 스코티시폴드 귀
│   └── ...
├── other/
│   └── base.png              # 기타 동물 기본 캐릭터
└── layers/
    ├── ear_red.png           # 귀 문제 하이라이트
    ├── belly_alert.png        # 소화 문제 하이라이트
    ├── skin_patch.png         # 피부 문제 하이라이트
    ├── head_heat.png          # 발열 하이라이트
    └── tired_eyes.png         # 피곤한 눈
```

## 레이어 우선순위 (z-index)

1. **base layer** (z-index: 1) - 기본 캐릭터
2. **breed layer** (z-index: 2-3) - 품종별 레이어 (귀, 색상 필터)
3. **health layer** (z-index: 4) - 건강 상태 레이어
4. **tags** (z-index: 10) - 건강 상태 태그

## 이미지 규격

- **크기**: 200x200px (1:1 비율)
- **형식**: PNG (투명 배경)
- **해상도**: 최소 2x (400x400px) 권장
- **색상 모드**: RGBA

## 구현 가이드

### 1. 기본 캐릭터 (base.png)
- 종별로 기본 캐릭터 1개씩
- 중립적인 표정, 정면 또는 약간 측면
- 투명 배경

### 2. 품종별 레이어
- **귀 레이어**: 품종별 귀 모양만 포함
- **색상 필터**: CSS로 적용 가능하지만, 필요시 PNG 레이어로도 가능

### 3. 건강 상태 레이어
- **귀 문제**: 귀 부위 빨간색 하이라이트
- **소화 문제**: 배 부위 노란색/주황색 하이라이트
- **피부 문제**: 전신 피부 트러블 표시
- **발열**: 머리/전신 빨간색 글로우
- **피곤**: 눈 주변 어두운 그림자

## Fallback 동작

PNG 파일이 없을 경우:
- 기본 캐릭터: 이모지로 표시 (🐶, 🐱, 🐾)
- 건강 레이어: CSS로 색상 하이라이트 표시
- 품종 레이어: CSS 색상 필터로 대체

## 사용 예시

```jsx
<AvatarLayered 
  pet={{
    name: "초코",
    species: "dog",
    breed: "푸들"
  }}
  healthFlags={{
    earIssue: true,
    energyLevel: 0.6
  }}
/>
```

## 디자인 툴 추천

- **Figma**: 레이어 구조 설계 및 내보내기
- **Adobe Illustrator**: 벡터 기반 디자인
- **Procreate**: 터치 기반 그리기
- **AI 이미지 생성**: Midjourney, DALL-E 등으로 기본 캐릭터 생성 후 편집

