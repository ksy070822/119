# 결제 대란 · Payment Crisis RPG v2.0

PixiJS 기반 완성 버전. 설계 문서 `payment_crisis_rpg_v2_pixijs.docx` 기준 전면 리뉴얼.

## 기술 스택

- **렌더링**: PixiJS 7.x (WebGL 2D)
- **UI**: HTML/CSS (DOM 오버레이)
- **애니메이션**: GSAP (선택)
- **사운드**: Howler.js (선택)
- **빌드**: Vite

## 프로젝트 구조

```
payment-crisis-rpg/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── assets/backgrounds/   # 배경 이미지
├── src/
│   ├── main.js
│   ├── core/           # GameEngine, StateManager, AssetLoader, SceneManager
│   ├── scenes/         # TitleScene, GameScene, EndingScene
│   ├── systems/        # StageManager, RiskGauge, ChoiceSystem, AllySystem, GuardianSystem, ItemSystem, EndingEvaluator
│   ├── data/           # stages, choices, allies, guardians, endings, roles, scenarioSteps
│   └── styles/         # main.css
└── data/               # 원본 JSON (참고용)
```

## 실행

```bash
npm install
npm run dev    # 개발 서버 (http://localhost:5173)
npm run build  # dist/ 빌드
npm run preview  # dist 미리보기
```

## 게임 정체성

- **정답/오답 없음**: 모든 선택은 진행 가능, 리스크만 변화
- **판단 / 영향 / 리스크** 프레임으로 결과 설명
- Decision Checkpoint: `checkpoint:true` 선택 후 재확인 오버레이 (수정해도 패널티 없음)
- 동료 보완: 리스크 조건 충족 시 자동 등장, 리스크 완화
- 관장자: '조언 요청' 클릭 시에만 등장, 판단 기준·리스크만 설명
- 엔딩: S / A / B / C (confusionPeak, promiseRiskCount, scopeClarityScore 기반)

## 배포

- `npm run build` 후 `dist/`를 Vercel/Netlify 또는 사내 정적 호스팅에 배포
