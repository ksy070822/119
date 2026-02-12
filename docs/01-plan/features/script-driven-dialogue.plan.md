# PDCA Plan: Script-Driven Dialogue System + Visual Fixes

## Feature: script-driven-dialogue
## Status: Plan
## Created: 2026-02-09

---

## 1. Problem Statement

### 1-1. 대사/스토리 구조 문제 (핵심)

현재 구현은 **"4영웅 모두에게 반드시 말 걸기 → 결정 → 관장자"** 구조로,
GAME_SCRIPT.md와 크게 괴리:

| 현재 | GAME_SCRIPT | 문제 |
|------|-------------|------|
| 4영웅 모두 필수 대화 | 스크립트에 따라 특정 캐릭터가 말하는 순서 | 반복적, 지루 |
| 매 스테이지 4명 모두 아이템 지급 | 스테이지당 1개 아이템 | 아이템 중복, 의미 희석 |
| 관장자 갑자기 활성화 | "CCO에게 조언을 구해보세요" 등 가이드 | 맥락 없는 등장 |
| 선택 캐릭터가 NPC처럼 대기 | 선택 캐릭터는 직접 대사를 말함 (auto) | 몰입감 부족 |
| 스테이지 시작 시 나레이션 없음 | 상황 설명 나레이션으로 시작 | 맥락 부족 |
| 대화 간 연결 없음 | 캐릭터간 대화가 자연스럽게 이어짐 | 단절감 |

### 1-2. 비주얼/UX 문제 (이전 요청 포함)

| # | 문제 | 원인 |
|---|------|------|
| A | 캐릭터 스프라이트에 검정/흰 사각 배경 | Player.js `PIXI.Texture.WHITE` 사용 |
| B | 관장자 이미지 미적용 (fallback 사각형) | 이미지가 잘못된 위치, assetPaths 미등록 |
| C | 왼쪽 이동 시 오른쪽 이미지 | walk_left 플립 로직 버그 |
| D | 대사 줄바꿈 문제 (`\n` 미표시) | DialogueBox에 `white-space: pre-line` 없음 |
| E | "다섯 영웅의 소집" 텍스트 작고 효과 없음 | CSS `font-size: 1.5rem`만 있음 |
| F | 좌측 패널이 게임맵 NPC 가림 | 레이아웃 구조 문제 |
| G | 하단 대사 박스 작고 눈에 안 띔 | font-size/padding 부족 |

---

## 2. Solution: Script-Driven Stage Flow

### 2-1. 핵심 개념: Stage Script

각 스테이지를 **이벤트 시퀀스**로 정의. 현재의 "모두에게 말 걸기" 대신
GAME_SCRIPT 순서대로 스토리가 전개됨.

```
StageEvent 타입:
  - narration     : 나레이션 (자동 표시, 클릭으로 넘김)
  - auto_dialogue : 선택 캐릭터 또는 특정 NPC가 자동으로 말함
  - talk_heroes   : 영웅들에게 말 걸기 (! 표시, 자유 순서)
  - item_reward   : 아이템 획득
  - decision      : 선택지 대화
  - guide         : 가이드 메시지 (화면 상단/중앙)
  - talk_guardian  : 관장자에게 말 걸기 (! 표시)
  - stage_complete : 스테이지 완료 → 전환
```

### 2-2. 스테이지별 이벤트 시퀀스

#### S1: 장애 인지 — 첫 행동
```
1. [narration]      "결제 장애가 보고되었습니다..."
2. [auto_dialogue]   커뮤니케이터: "큰일이에요! 결제 장애 괴물이..."
3. [auto_dialogue]   컨트롤타워: "침착하게. 우선 상황부터 파악하자."
4. [guide]           "동료들에게 말을 걸어 상황을 파악하세요 (Space/클릭)"
5. [talk_heroes]     4영웅 대화 가능 (각 1줄 대사)
6. [item_reward]     "상황 파악 보고서" 획득
7. [auto_dialogue]   커뮤니케이터: "마을 주민들 문의가 계속..."
8. [decision]        S1 선택지 (3개)
9. [guide]           "CCO 관장자에게 초기 공지에 대한 조언을 구해보세요"
10.[talk_guardian]    CCO 대화
11.[stage_complete]
```

#### S2: 초기 대응 — 공지 판단
```
1. [narration]       "장애 발생 25분. 원인 불명, 주민 문의 급증."
2. [guide]           "동료들에게 최신 상황을 확인하세요"
3. [talk_heroes]     4영웅 대화
4. [item_reward]     "타임라인 기록부" 획득
5. [auto_dialogue]   커뮤니케이터: "주민 문의가 100건..."
6. [decision]        S2 선택지
7. [auto_dialogue]   컨트롤타워 조언 (타겟 커뮤니케이션)
8. [guide]           "대외협력 관장자에게 제휴사 안내에 대한 조언을 구해보세요"
9. [talk_guardian]    대외협력 대화
10.[stage_complete]
```

#### S3: 위기 심화 — 심화 공지
```
1. [narration]       "장애가 100분을 넘어서고..."
2. [auto_dialogue]   리포터: "여러분! 장애가 100분 넘게..."
3. [guide]           "동료들에게 상황을 확인하세요"
4. [talk_heroes]     4영웅 대화
5. [item_reward]     "상황 분석 리포트" 획득
6. [decision]        S3 선택지
7. [guide]           "PR 관장자에게 공지 문구 조언을 구해보세요"
8. [talk_guardian]    PR 대화
9. [guide]           "CTO에게도 기술 상황을 확인받으세요"
10.[talk_guardian]    CTO 대화
11.[stage_complete]
```

#### S4: 복구
```
1. [narration]       "내부 시스템이 복구되었습니다..."
2. [auto_dialogue]   리포터: "테크리더, 상황이 어때요?"
3. [auto_dialogue]   테크리더: "내부는 완전 정상화..."
4. [auto_dialogue]   리포터: "등급 하향을 검토해볼까요?"
5. [guide]           "동료들과 합의하세요"
6. [talk_heroes]     4영웅 확인 대화
7. [decision]        S4 선택지
8. [guide]           "CTO 관장자에게 복구 상태를 확인받으세요"
9. [talk_guardian]    CTO 대화
10.[auto_dialogue]   테크리더: "완전 복구 확인!"
11.[item_reward]     "복구 완료 인증서" 획득
12.[stage_complete]  → 보스전
```

#### S5: 후속 조치
```
1. [narration]       "장애가 종료되었습니다..."
2. [auto_dialogue]   리포터: "수고하셨어요. 마무리가 중요해요."
3. [decision]        S5 선택지
4. [auto_dialogue]   컨트롤타워: "이번 경험을 기록으로..."
5. [auto_dialogue]   테크커뮤니케이터: "재발 방지 노력 안내..."
6. [item_reward]     "위기 대응 완료 인장" 획득
7. [stage_complete]  → 엔딩
```

### 2-3. 선택 캐릭터 처리

- **자신의 대사 차례**: 자동으로 대사 박스에 표시 (이동 불필요)
- **다른 캐릭터 대사**: 해당 NPC 머리 위에 `!` 표시 → 클릭/Space로 대화
- **talk_heroes 페이즈**: 대화 안 한 NPC에만 `!` 표시, 자유 순서 대화

### 2-4. 가이드 메시지

화면 상단 중앙에 반투명 배너로 표시:
```css
.guide-message {
  position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.8); border: 1px solid #FFD700;
  padding: 12px 24px; border-radius: 10px;
  color: #FFD700; font-size: 15px;
  animation: fadeInDown 0.4s ease;
  z-index: 25;
}
```
- 3~5초 표시 후 자동 사라짐
- 클릭 시 즉시 사라짐

---

## 3. 변경 파일 목록

### Phase A: 비주얼/UX 수정 (이전 요청 포함)

| # | 파일 | 변경 내용 |
|---|------|----------|
| A1 | `src/map/Player.js` | `Texture.WHITE` → `Texture.EMPTY`, fallback도 동일 |
| A2 | `src/map/Player.js` | walk_left 플립: walkLeft===walkRight일 때만 flip |
| A3 | `src/scenes/GameScene.js` | DOM모드 walk_left: walkLeft!==walkRight 체크 |
| A4 | `src/dialogue/DialogueBox.js` | `white-space: pre-line` 추가 |
| A5 | `src/dialogue/DialogueBox.js` | 대사박스 크기 확대: min-height 180px, padding 24px, font 18px |
| A6 | `src/styles/main.css` | "다섯 영웅의 소집" font-size 2.5rem + glow 효과 |
| A7 | 관장자 이미지 복사 | 부모 public/ → payment-crisis-rpg/public/assets/characters/guardians/ |
| A8 | `src/data/assetPaths.js` | 관장자 폴더 매핑 추가 |
| A9 | `src/data/characters.js` | 관장자 캐릭터 데이터 추가 (cco, cto, pr, externalAffairs) |

### Phase B: Script-Driven 대화 시스템

| # | 파일 | 변경 내용 |
|---|------|----------|
| B1 | `src/data/stageScripts.js` (신규) | 5스테이지 이벤트 시퀀스 정의 |
| B2 | `public/data/dialogues.json` | GAME_SCRIPT 기반 전면 재작성 (아이템 중복 제거, auto 대사 추가) |
| B3 | `src/scenes/GameScene.js` | StageScriptRunner 통합, 이벤트 순차 실행 로직 |
| B4 | `src/map/NPC.js` | 관장자 스프라이트 로딩 (characterId 기반) |
| B5 | `src/ui/GuideMessage.js` (신규) | 가이드 메시지 UI 컴포넌트 |
| B6 | `src/styles/main.css` | 가이드 메시지 스타일, 대화 박스 개선 |

### Phase C: 레이아웃 재구성

| # | 파일 | 변경 내용 |
|---|------|----------|
| C1 | `src/scenes/GameScene.js` | 좌측 패널: 캐릭터+아이템+메시지 로그, 게임영역 우측 배치 |
| C2 | `src/styles/main.css` | `.game-left-panel` 200→220px, 메시지 로그 영역 추가 |
| C3 | `public/data/maps.json` | NPC 위치 하향 조정 (y: 350~500), 좌우 모음 |

---

## 4. 상세 설계

### 4-1. `src/data/stageScripts.js` (신규)

```javascript
export const STAGE_SCRIPTS = {
  S1: {
    events: [
      { type: 'narration', text: '결제 장애가 보고되었습니다.\n컨트롤센터에 긴장감이 감돕니다.' },
      { type: 'auto_dialogue', characterId: 'communicator',
        text: '큰일이에요! 결제 장애 괴물이 마을로 다가오고 있어요!\n마을 주민들이 걱정하고 있어요. 문의가 쏟아지고 있어요!' },
      { type: 'auto_dialogue', characterId: 'controlTower',
        text: '침착하게. 우선 상황부터 파악하자.' },
      { type: 'guide', text: '동료들에게 말을 걸어 상황을 파악하세요 (Space 또는 클릭)' },
      { type: 'talk_heroes' },
      { type: 'item_reward', itemName: '상황 파악 보고서', itemDesc: '초기 상황 파악 능력이 향상됩니다!', itemSlot: 1 },
      { type: 'auto_dialogue', characterId: 'communicator',
        text: '마을 주민들 문의가 계속 늘고 있어요.\n우리가 먼저 어떻게 대응할지 정해야 해요.' },
      { type: 'decision', dialogueId: 'S1_DECISION' },
      { type: 'guide', text: 'CCO 관장자에게 초기 공지에 대한 조언을 구해보세요' },
      { type: 'talk_guardian' },
      { type: 'stage_complete' },
    ],
    heroDialogues: {
      // hero_0~3에 매핑된 캐릭터별 대사 (ALLY_ORDER 기반)
      techLeader: '지금 시스템 점검 중이에요. 원인이 내부인지 외부인지 아직 몰라요.',
      techCommunicator: '기술적인 내용은 제가 쉽게 풀어서 전달할게요.',
      controlTower: '아직 원인이 불명확해요. 범위부터 파악합시다.',
      reporter: '지금부터 타임라인 기록 시작할게요. 모든 결정의 시간이 중요해요.',
      communicator: '마을 주민 문의를 취합하고 있어요. 패턴이 보이기 시작해요.',
    },
    guardian: 'cco',
  },
  S2: { ... },  // 동일 구조
  S3: { ... },
  S4: { ... },
  S5: { ... },
};
```

### 4-2. GameScene 이벤트 실행기

```javascript
// GameScene 내부
async _runStageScript(stageNum) {
  const script = STAGE_SCRIPTS[`S${stageNum}`];
  for (const event of script.events) {
    switch (event.type) {
      case 'narration':
        await this._showNarration(event.text);
        break;
      case 'auto_dialogue':
        await this._showAutoDialogue(event);
        break;
      case 'guide':
        this._showGuideMessage(event.text);
        break;
      case 'talk_heroes':
        await this._waitForHeroTalks(script);
        break;
      case 'item_reward':
        await this._giveItemReward(event);
        break;
      case 'decision':
        await this._runDecision(event.dialogueId);
        break;
      case 'talk_guardian':
        await this._waitForGuardianTalk();
        break;
      case 'stage_complete':
        await this._transitionToNextStage();
        break;
    }
  }
}
```

### 4-3. auto_dialogue 처리

선택 캐릭터의 대사인 경우:
- 대사 박스에 자동 표시 (이동 불필요)
- 초상화 + 캐릭터명 + 대사

다른 캐릭터의 대사인 경우:
- 해당 NPC 머리 위 `!` 표시 + 대사 박스 자동 표시
- (auto이므로 클릭 불필요, 읽고 넘기기만)

### 4-4. talk_heroes 처리

1. 대화 안 한 영웅 NPC에 `!` 표시
2. 선택 캐릭터는 제외 (이미 함께 있으므로)
3. 플레이어가 자유 순서로 NPC 접근 → Space/클릭 → 1줄 대사
4. 모든 영웅 대화 완료 → 다음 이벤트 진행

### 4-5. 관장자 매핑

```javascript
const GUARDIAN_MAP = {
  S1: { id: 'cco', name: 'CCO', color: '#E67E22' },
  S2: { id: 'externalAffairs', name: '대외협력', color: '#3498DB' },
  S3: [
    { id: 'pr', name: 'PR', color: '#9B59B6' },
    { id: 'cto', name: 'CTO', color: '#E74C3C' },
  ],
  S4: { id: 'cto', name: 'CTO', color: '#E74C3C' },
  // S5: 관장자 없음
};
```

S3은 PR과 CTO 2명 방문 (GAME_SCRIPT 참조).

### 4-6. 아이템 재설계

스테이지당 1개 아이템으로 변경:

| Stage | 아이템 | Slot |
|-------|--------|------|
| S1 | 상황 파악 보고서 | 1 |
| S2 | 타임라인 기록부 | 2 |
| S3 | 상황 분석 리포트 | 3 |
| S4 | 복구 완료 인증서 | 4 |
| S5 | 위기 대응 완료 인장 | (최종) |

### 4-7. 좌측 패널 메시지 로그

아이템 획득, 스킬 습득 등의 메시지를 좌측 패널 하단에 표시:
```
┌─────────────────┐
│ [캐릭터 초상화] │
│  커뮤니케이터   │
│                 │
│ [아이템 슬롯 5] │
│  ○ ○ ○ ○ ○    │
│                 │
│ ── 활동 로그 ── │
│ 📋 상황 파악    │
│    보고서 획득!  │
│ 📜 신중한 공지의 │
│    원칙을 배움!  │
└─────────────────┘
```

---

## 5. 비주얼 수정 상세

### A1. Player.js 투명 배경
```diff
- this.sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
+ this.sprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
```
```diff
- Assets.load(u).catch(() => PIXI.Texture.WHITE)
+ Assets.load(u).catch(() => PIXI.Texture.EMPTY)
```

### A2. Walk-Left 플립 (Player.js)
```javascript
_setPose(pose) {
    const tex = this._textures[pose] || this._textures.idle;
    if (this.sprite.texture !== tex) {
      this.sprite.texture = tex;
      this._applyTextureScale(tex);
    }
    const absScaleX = Math.abs(this.sprite.scale.x) || 1;
    // walk_left: fallback(=walkRight)인 경우에만 flip
    const needsFlip = pose === 'walk_left' &&
      this._textures['walk_left'] === this._textures['walk_right'];
    if (needsFlip) {
      this.sprite.scale.x = -absScaleX;
    } else if (this.sprite.scale.x < 0) {
      this.sprite.scale.x = absScaleX;
    }
}
```

### A3. Walk-Left 플립 (GameScene DOM 모드)
```diff
- if (char.sprites.walkLeft && char.sprites.walkLeft !== char.sprites.idle) {
+ if (char.sprites.walkLeft && char.sprites.walkLeft !== char.sprites.walkRight) {
```

### A4-A5. DialogueBox 개선
```diff
- this.el.style.cssText = '...min-height:150px;...padding:20px;...';
+ this.el.style.cssText = '...min-height:180px;...padding:24px 28px;...';
```
- `.dialogue-text`: font-size 16→18px, white-space: pre-line
- `.dialogue-speaker`: font-size 18→20px
- `.dialogue-hint`: font-size 12→14px

### A6. "다섯 영웅의 소집" 강화
```css
.intro-portraits::before {
  font-size: 2.5rem;
  color: #FFD700;
  text-shadow:
    0 0 20px rgba(255,215,0,0.8),
    0 0 40px rgba(255,215,0,0.4),
    0 2px 8px rgba(0,0,0,0.9);
  animation: heroTitleGlow 2s ease-in-out infinite alternate;
}
@keyframes heroTitleGlow {
  from { text-shadow: 0 0 20px rgba(255,215,0,0.8), 0 2px 8px rgba(0,0,0,0.9); }
  to { text-shadow: 0 0 40px rgba(255,215,0,1), 0 0 60px rgba(255,215,0,0.5), 0 2px 8px rgba(0,0,0,0.9); }
}
```

### A7-A9. 관장자 이미지 설정
1. 이미지 복사: `장애대응/public/assets/characters/guardians/` → `payment-crisis-rpg/public/assets/characters/guardians/{cco,cto,pr,external_affairs}/`
2. 파일명 정규화 (공백 제거)
3. assetPaths.js에 관장자 폴더 매핑
4. characters.js에 관장자 캐릭터 데이터 (sprites 포함)

---

## 6. 실행 순서

```
Phase A (비주얼 수정) — 약 30분
  A1 → A2 → A3 → A4 → A5 → A6 → A7 → A8 → A9

Phase B (Script-Driven 대화) — 약 60분
  B1 → B2 → B3 → B4 → B5 → B6

Phase C (레이아웃) — 약 20분
  C1 → C2 → C3

빌드 검증 → npm run build
```

---

## 7. 검증 항목

- [ ] 캐릭터 스프라이트 투명 배경 확인
- [ ] 관장자 이미지 정상 로딩
- [ ] 왼쪽 이동 시 좌우반전 정상 작동
- [ ] 대사 줄바꿈(`\n`) 정상 표시
- [ ] "다섯 영웅의 소집" 큰 글씨 + 글로우 효과
- [ ] S1~S5 스크립트 순서대로 스토리 전개
- [ ] 선택 캐릭터 자동 대사
- [ ] 다른 캐릭터 `!` 표시 후 클릭/Space
- [ ] 가이드 메시지 표시 ("CCO에게 조언을 구해보세요" 등)
- [ ] 스테이지당 1개 아이템만 지급
- [ ] 관장자 방문 전 가이드 메시지
- [ ] 좌측 패널에 활동 로그
- [ ] 하단 대사 박스 확대
- [ ] npm run build 성공

---

## 8. Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| StageScript 이벤트 순서 꼬임 | 게임 진행 불가 | async/await 순차 실행, 이벤트 완료 Promise |
| 관장자 이미지 누락 | fallback 사각형 표시 | NPC.js fallback 유지 |
| 기존 DialogueManager 호환 | 대화 진행 안됨 | DialogueManager 인터페이스 유지, 래핑 |
