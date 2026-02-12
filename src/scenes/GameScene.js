/**
 * 메인 게임 씬: PixiJS GameMap + Camera + Player(방향키/WASD 이동) + NPC(Space 대화) + 대화/선택
 * GAME_SCRIPT 기반 — 5영웅+관장자 대화 구조
 */
import { Container, Sprite, Graphics } from 'pixi.js';
import { GameMap } from '../map/GameMap.js';
import { Camera } from '../map/Camera.js';
import { Player } from '../map/Player.js';
import { NPC } from '../map/NPC.js';
import { DialogueManager } from '../dialogue/DialogueManager.js';
import { DialogueBox } from '../dialogue/DialogueBox.js';
import { ChoicePanel } from '../dialogue/ChoicePanel.js';
import { EffectManager } from '../effects/EffectManager.js';
import { ScreenEffects } from '../effects/ScreenEffects.js';
import { StageManager } from '../systems/StageManager.js';
import { RiskGauge } from '../systems/RiskGauge.js';
import { ChoiceSystem } from '../systems/ChoiceSystem.js';
import { AllySystem } from '../systems/AllySystem.js';
import { ItemSystem } from '../systems/ItemSystem.js';
import { EndingEvaluator } from '../systems/EndingEvaluator.js';
import { SCENARIO_STEPS } from '../data/scenarioSteps.js';
import { ROLES, ALLY_POSITIONS } from '../data/roles.js';
import { getItemImage, getGuildBg, getGuardianIdle, getGuardianPortrait } from '../data/assetPaths.js';
import { CHARACTERS, ALLY_ORDER } from '../data/characters.js';

const PLAYER_SPEED = 10;
const PLAYER_HALF = 40;
const NEAR_DISTANCE = 90;

/** 아이템 이름 매핑 (제공 캐릭터별) */
const ITEM_NAME_MAP = {
  techLeader: { name: '시스템 점검 리포트', desc: '기술 분석 역량이 향상됩니다!' },
  techCommunicator: { name: 'FAQ 번역 카드', desc: '기술→마을주민 소통 역량이 향상됩니다!' },
  controlTower: { name: '타겟 커뮤니케이션 전략', desc: '범위 판단 역량이 향상됩니다!' },
  reporter: { name: '타임라인 기록부', desc: '시간 관리 역량이 향상됩니다!' },
  communicator: { name: '공지 스크롤 초안', desc: '공지 작성 역량이 향상됩니다!' },
};

const STAGE_COLOR_OVERLAYS = {
  1: 'rgba(46, 204, 113, 0.06)',
  2: 'rgba(241, 196, 15, 0.1)',
  3: 'rgba(230, 126, 34, 0.12)',
  4: 'rgba(231, 76, 60, 0.14)',
  5: 'rgba(46, 204, 113, 0.04)',
};

const STAGE_FADE_COLORS = {
  1: '#1a2a1a',
  2: '#2a2a1a',
  3: '#2a1f1a',
  4: '#2a1a1a',
  5: '#1a2a1a',
};

export class GameScene {
  constructor(engine) {
    this.engine = engine;
    this.stageManager = new StageManager(engine.state);
    this.riskGauge = new RiskGauge(engine.state);
    this.choiceSystem = new ChoiceSystem(engine.state);
    this.allySystem = new AllySystem(engine.state);
    this.itemSystem = new ItemSystem(engine.state);
    this.endingEvaluator = new EndingEvaluator(engine.state);
    this.stepIndex = 0;
    this.pendingCheckpoint = null;
    this.domRoot = null;
    this.bgContainer = null;
    this.playerX = 0;
    this.playerY = 0;
    this.keys = {};
    this._rightArea = null;
    this._villageWrap = null;
    this._playerEl = null;
    this._villLoopId = null;
    this.gameMap = null;
    this.player = null;
    this.camera = null;
    this.mapsData = null;
    this.npcs = [];
    this._nearestNPC = null;
    this._interactionHintEl = null;
    // 새 플로우 상태
    this._decisionTriggered = false;
    this._guardianUnlocked = false;
    this._heroTalkedCount = 0;
  }

  async init() {
    return this;
  }

  _showLoadWarning(mapError, dialogueError) {
    const overlay = document.getElementById('dom-overlay');
    if (!overlay) return;

    const warning = document.createElement('div');
    warning.className = 'load-warning';
    warning.style.cssText = `
      position: fixed;
      top: 16px;
      right: 16px;
      background: rgba(180, 80, 0, 0.9);
      color: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 100;
      max-width: 300px;
      animation: fadeIn 0.3s ease-out;
    `;

    let msg = '일부 게임 데이터를 불러오지 못했습니다.';
    if (mapError && dialogueError) {
      msg = '맵과 대화 데이터를 불러오지 못했습니다. 기본 모드로 진행합니다.';
    } else if (mapError) {
      msg = '맵 데이터를 불러오지 못했습니다.';
    } else if (dialogueError) {
      msg = '대화 데이터를 불러오지 못했습니다.';
    }
    warning.textContent = msg;
    overlay.appendChild(warning);

    setTimeout(() => {
      warning.style.opacity = '0';
      warning.style.transition = 'opacity 0.3s';
      setTimeout(() => warning.remove(), 300);
    }, 5000);
  }

  async enter() {
    const job = this.engine.state.get('selectedJob');
    if (!job) {
      this.engine.sceneManager.goTo('title');
      return;
    }
    this.engine.state.set({
      stage: 1,
      internalChaos: 0,
      externalRisk: 0,
      confusionPeak: 0,
      promiseRiskCount: 0,
      scopeClarityScore: 0,
      items: [true, false, false, false, false],
      itemSources: [job, null, null, null, null],
      choiceLog: [],
      elapsedMinutes: 0,
      allies: [],
      guardianShownThisStage: false,
    });
    this.stepIndex = 0;
    this.pendingCheckpoint = null;
    this.playerX = 0;
    this.playerY = 0;
    this.keys = {};
    this._decisionTriggered = false;
    this._guardianUnlocked = false;
    this._heroTalkedCount = 0;

    let stageNum = this.stageManager.getCurrentStage();
    const stageId = 'S' + stageNum;
    let mapLoadError = false;
    try {
      const res = await fetch('/data/maps.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.mapsData = await res.json();
    } catch (err) {
      console.warn('[GameScene] 맵 데이터 로드 실패:', err.message);
      mapLoadError = true;
      this.mapsData = { maps: {} };
    }
    const mapData = this.mapsData?.maps?.[stageId] ?? this.mapsData?.maps?.S1 ?? { width: 1280, height: 720, playerStart: { x: 640, y: 600 }, npcs: [], objects: [] };
    mapData.background = getGuildBg(stageNum);
    this.gameMap = new GameMap(mapData);
    this.player = new Player(4, job);
    this.player.x = mapData.playerStart?.x ?? 640;
    this.player.y = mapData.playerStart?.y ?? 600;
    this.player.container.x = this.player.x;
    this.player.container.y = this.player.y;
    this.gameMap.playerLayer.addChild(this.player.container);
    this.camera = new Camera(this.engine.width, this.engine.height);
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
    this.camera.applyTo(this.gameMap.container);

    this._spawnNpcs(mapData, job, stageNum);

    let dialogueLoadError = false;
    try {
      const dialRes = await fetch('/data/dialogues.json');
      if (!dialRes.ok) throw new Error(`HTTP ${dialRes.status}`);
      this.dialoguesData = await dialRes.json();
    } catch (err) {
      console.warn('[GameScene] 대화 데이터 로드 실패:', err.message);
      dialogueLoadError = true;
      this.dialoguesData = { dialogues: {} };
    }

    if (mapLoadError || dialogueLoadError) {
      this._showLoadWarning(mapLoadError, dialogueLoadError);
    }
    this.dialogueManager = new DialogueManager(this.dialoguesData, this.engine.state);
    this.dialogueBox = new DialogueBox(null);
    this.choicePanel = new ChoicePanel(null);
    this.effectManager = new EffectManager(this.gameMap?.effectLayer ?? null);
    this.screenEffects = new ScreenEffects(document.getElementById('dom-overlay') || document.body);

    this._setupPixi();
    this._setupDOM();
    if (this.domRoot && this.dialogueBox && this.choicePanel) {
      this.dialogueBox.container = this.domRoot;
      this.choicePanel.container = this.domRoot;
      this.choicePanel.onChoiceSelected = (c) => this._onDialogueChoiceSelected(c);
    }
    this._setupVillage();
    if (!this.gameMap) this._showBottomSituation();
    this._bindKeys();
    this._startVillageLoop();
    this.engine.bgm?.playForStage(this.stageManager.getCurrentStage());
  }

  /** NPC 생성 — hero_0~3에 ALLY_ORDER 매핑, 관장자 처리 */
  _spawnNpcs(mapData, job, stageNum) {
    const allyOrder = ALLY_ORDER[job];
    console.log('[NPC] 선택 직업:', job, '| 동료 순서:', allyOrder);
    console.log('[NPC] _spawnNpcs 호출됨 - 이전 heroTalkedCount:', this._heroTalkedCount);
    this.npcs = [];
    this._heroTalkedCount = 0;
    console.log('[NPC] heroTalkedCount 초기화 → 0');
    this._decisionTriggered = false;
    this._guardianUnlocked = false;
    // S1/S2: 관장자 후 '다른' 테크 영웅 1인과 대화 후 결정
    // 테크리더 플레이 → 테크커뮤니케이터에게 말 걸기 / 테크커뮤니케이터 플레이 → 테크리더에게 말 걸기
    this._finalHeroUnlocked = (stageNum !== 1 && stageNum !== 2);
    this._finalHeroId = (job === 'techCommunicator') ? 'techLeader' : 'techCommunicator';

    (mapData.npcs || []).forEach((npcData) => {
      let characterId = null;
      let overrideName = npcData.name;
      const npcId = npcData.id;

      if (npcId.startsWith('hero_')) {
        const heroIdx = parseInt(npcId.replace('hero_', ''), 10);
        characterId = allyOrder[heroIdx] ?? null;
        const charObj = characterId ? CHARACTERS[characterId] : null;
        overrideName = charObj ? charObj.name : npcData.name;
        // 동적 대화 ID: S{n}_{characterId}
        npcData = { ...npcData, dialogueId: `S${stageNum}_${characterId}` };
        console.log(`[NPC] ${npcId} → ${characterId} (${overrideName})`);
      } else if (npcId === 'guardian') {
        // 관장자 — characterId 없음(이전 hero의 characterId가 넘어가지 않도록)
        characterId = null;
        npcData = { ...npcData, isGuardian: true, dialogueId: `S${stageNum}_GUARDIAN` };
        console.log(`[NPC] guardian → ${npcData.name}`);
      }

      const npc = new NPC({ ...npcData, name: overrideName, characterId });
      this.gameMap.npcLayer.addChild(npc.sprite);
      this.npcs.push(npc);
      this._setupNPCClick(npc);

      // 디버깅: NPC 매핑 확인
      if (stageNum === 1 || stageNum === 5) {
        console.log(`[NPC 생성] ${npcData.id} → characterId: ${characterId}, name: ${overrideName}`);
      }
    });
    console.log('[NPC] 총', this.npcs.length, '개 생성 완료');
  }

  _setupPixi() {
    const stage = this.engine.pixi.stage;
    stage.removeChildren();
    if (this.gameMap) {
      stage.addChild(this.gameMap.container);
      return;
    }
    this.bgContainer = new Container();
    stage.addChild(this.bgContainer);
    const g = new Graphics();
    g.beginFill(0x1a1a2e);
    g.drawRect(0, 0, this.engine.width, this.engine.height);
    this.bgContainer.addChild(g);
    try {
      const bg = Sprite.from('/assets/backgrounds/village-bg.png');
      bg.anchor.set(0.5);
      bg.x = this.engine.width / 2;
      bg.y = this.engine.height / 2;
      const scale = Math.max(this.engine.width / (bg.width || 1), this.engine.height / (bg.height || 1));
      bg.scale.set(scale);
      this.bgContainer.addChild(bg);
    } catch (_) {}
  }

  _setupDOM() {
    const overlay = document.getElementById('dom-overlay');
    if (!overlay) return;
    const job = this.engine.state.get('selectedJob');
    if (!job) return;
    overlay.innerHTML = '';
    this.domRoot = document.createElement('div');
    this.domRoot.style.position = 'absolute';
    this.domRoot.style.inset = '0';
    this.domRoot.style.pointerEvents = 'none';
    this.domRoot.style.display = 'flex';
    this.domRoot.style.flexDirection = 'row';
    overlay.appendChild(this.domRoot);

    const role = ROLES.find((r) => r.id === job);
    const portraitSrc = role?.imagePath ?? '';
    const portraitHtml = portraitSrc
      ? `<img class="hero-portrait-img" src="${portraitSrc}" alt="${role?.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"><span class="hero-fallback-icon" style="display:none">${role?.icon ?? '📜'}</span>`
      : `<span class="hero-fallback-icon">${role?.icon ?? '📜'}</span>`;
    const items = this.engine.state.get('items') ?? [true, false, false, false, false];
    const itemSources = this.engine.state.get('itemSources') ?? [job, null, null, null, null];
    const itemSlotsHtml = this._renderItemSlots(items, itemSources, role);

    const leftPanel = document.createElement('div');
    leftPanel.className = 'game-left-panel';
    leftPanel.style.pointerEvents = 'auto';
    leftPanel.innerHTML = `
      <div class="character-panel">
        <div class="hero-portrait-wrap">${portraitHtml}</div>
        <div class="hero-name">${role?.name ?? job}</div>
        <div class="item-slots-label">획득 아이템 <span class="item-slots-hint">(동료 만날 때마다 쌓임)</span></div>
        <div class="item-slots" id="game-item-slots">${itemSlotsHtml}</div>
      </div>
    `;
    this._leftPanel = leftPanel;
    const app = document.getElementById('app');
    if (app) {
      app.style.position = 'relative';
      app.appendChild(leftPanel);
    } else {
      this.domRoot.appendChild(leftPanel);
    }

    const rightArea = document.createElement('div');
    rightArea.className = 'game-right-area';
    rightArea.style.flex = '1';
    rightArea.style.display = 'flex';
    rightArea.style.flexDirection = 'column';
    rightArea.style.minWidth = '0';
    rightArea.style.position = 'relative';
    this.domRoot.appendChild(rightArea);
    this._rightArea = rightArea;

    if (this.gameMap) {
      const stageOverlay = document.createElement('div');
      stageOverlay.className = 'stage-color-overlay';
      stageOverlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;';
      this.domRoot.insertBefore(stageOverlay, this.domRoot.firstChild);
      this._stageColorOverlay = stageOverlay;
      this._updateStageColorOverlay();

      const hint = document.createElement('div');
      hint.className = 'interaction-hint';
      hint.style.cssText = 'position:fixed;bottom:180px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;padding:8px 16px;border-radius:8px;font-size:14px;display:none;pointer-events:none;z-index:20;';
      hint.textContent = '클릭 또는 Space: 대화';
      this.domRoot.appendChild(hint);
      this._interactionHintEl = hint;
    }

    const riskTopBar = document.getElementById('game-risk-top-bar');
    if (riskTopBar) {
      const chaos = this.riskGauge.getChaosLabel(this.engine.state.get('internalChaos'));
      const ext = this.riskGauge.getExternalLabel(this.engine.state.get('externalRisk'));
      const chaosPct = this.engine.state.get('internalChaos') ?? 0;
      const extPct = this.engine.state.get('externalRisk') ?? 0;
      riskTopBar.innerHTML = `
        <div class="risk-half chaos">
          <span class="risk-title">조직 혼란</span>
          <span class="risk-value" id="risk-chaos-label">${chaos}</span>
          <div class="risk-bar-wrap"><div class="risk-bar" id="risk-chaos-bar" style="width:${chaosPct}%"></div></div>
        </div>
        <div class="risk-half external">
          <span class="risk-title">대외 위험</span>
          <span class="risk-value" id="risk-external-label">${ext}</span>
          <div class="risk-bar-wrap"><div class="risk-bar" id="risk-external-bar" style="width:${extPct}%"></div></div>
        </div>
      `;
      riskTopBar.style.display = 'flex';
    }

    const hud = document.createElement('div');
    hud.className = 'game-hud';
    hud.style.pointerEvents = 'auto';
    const stageNum = this.stageManager.getCurrentStage();
    const stageName = this.stageManager.getStageName(stageNum);
    const elapsed = this.engine.state.get('elapsedMinutes');
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    hud.innerHTML = `
      <div class="stage-bar" id="hud-stage-bar">
        ${[1, 2, 3, 4, 5].map((i) => `<span class="stage-dot ${i === stageNum ? 'active' : ''}" data-stage="${i}"></span>`).join('')}
      </div>
      <div class="elapsed-time" id="hud-time">경과 ${mm}:${ss}</div>
      <div class="stage-name" id="hud-stage-name" data-stage-num="${stageNum}">${stageName}</div>
    `;
    rightArea.appendChild(hud);
    this._updateRiskBars();
  }

  _getRoleForItemSource(sourceId, isAlly) {
    if (!sourceId) return null;
    if (isAlly) {
      const allies = this.allySystem.getAllies();
      const ally = allies.find((a) => a.id === sourceId);
      if (!ally) return null;
      return ROLES.find((r) => r.name === ally.name) ?? null;
    }
    return ROLES.find((r) => r.id === sourceId) ?? null;
  }

  _renderItemSlots(items, itemSources, playerRole) {
    const sources = itemSources ?? [null, null, null, null, null];
    return items.map((filled, i) => {
      const sourceId = sources[i];
      const itemName = sourceId && ITEM_NAME_MAP[sourceId] ? ITEM_NAME_MAP[sourceId].name : '';
      if (!filled) {
        return `<div class="item-slot" data-slot="${i}"><div class="item-slot-icon-wrap"></div><span class="item-slot-name"></span></div>`;
      }
      const isAlly = sourceId && sourceId !== this.engine.state.get('selectedJob');
      const role = this._getRoleForItemSource(sourceId, !!isAlly) ?? playerRole;
      const itemImg = sourceId ? getItemImage(sourceId, 0) : role?.itemImagePath;
      const icon = role?.icon ?? '📦';
      const iconHtml = itemImg
        ? `<img src="${itemImg}" alt="" class="item-slot-img" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"><span class="item-slot-icon" style="display:none">${icon}</span>`
        : `<span class="item-slot-icon">${icon}</span>`;
      return `<div class="item-slot filled" data-slot="${i}"><div class="item-slot-icon-wrap">${iconHtml}</div><span class="item-slot-name">${itemName}</span></div>`;
    }).join('');
  }

  _setupVillage() {
    if (this.gameMap) return;
    if (!this._rightArea) return;
    const job = this.engine.state.get('selectedJob');
    const role = ROLES.find((r) => r.id === job);

    const villageWrap = document.createElement('div');
    villageWrap.className = 'village-wrap';
    villageWrap.style.flex = '1';
    villageWrap.style.position = 'relative';
    villageWrap.style.minHeight = '200px';
    villageWrap.style.pointerEvents = 'auto';
    this._rightArea.appendChild(villageWrap);
    this._villageWrap = villageWrap;

    this.playerX = (villageWrap.offsetWidth || 400) / 2 - PLAYER_HALF;
    this.playerY = (villageWrap.offsetHeight || 300) / 2 - PLAYER_HALF;

    const char = CHARACTERS[job];
    const playerIdleSrc = char?.sprites?.idle ?? '';
    const playerHtml = playerIdleSrc
      ? `<div class="player-sprite-shadow"></div><img src="${playerIdleSrc}" alt="${role?.name ?? ''}" class="player-sprite-img" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"><span class="player-icon" style="display:none">${role?.icon ?? '📜'}</span>`
      : `<div class="player-sprite-shadow"></div><span class="player-icon">${role?.icon ?? '📜'}</span>`;

    const player = document.createElement('div');
    player.className = 'player-sprite';
    player.id = 'game-player-sprite';
    player.innerHTML = playerHtml;
    player.style.left = this.playerX + 'px';
    player.style.top = this.playerY + 'px';
    villageWrap.appendChild(player);
    this._playerEl = player;
    this._playerImg = player.querySelector('.player-sprite-img');
    this._playerChar = char;
    this._facing = 'idle';
    this._flipX = false;

    const hint = document.createElement('div');
    hint.className = 'village-keys-hint';
    hint.textContent = '← → ↑ ↓ 이동 · Space 대화';
    villageWrap.appendChild(hint);
  }

  _bindKeys() {
    const self = this;
    const keyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
        self.keys[e.key] = true;
        if (e.key === ' ') self._onSpace();
      }
    };
    const keyUp = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
        self.keys[e.key] = false;
      }
    };
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    this._keyCleanup = () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }

  _setupNPCClick(npc) {
    if (!npc?.sprite) return;
    npc.sprite.eventMode = 'static';
    npc.sprite.cursor = 'pointer';
    // 중복 등록 방지: 기존 리스너 제거 후 등록
    npc.sprite.removeAllListeners('pointertap');
    npc.sprite.on('pointertap', () => this._onNPCClick(npc));
  }

  _onNPCClick(npc) {
    if (!this.gameMap || !this.player) return;
    if (this.player.isWalkingToTarget()) return;
    if (!this.player.canMove) return;
    const stageNum = this.stageManager.getCurrentStage();
    const s2FinalTalk = (stageNum === 2 && npc.characterId === this._finalHeroId && this._finalHeroUnlocked && !this._decisionTriggered);
    if (npc.hasSpoken && !s2FinalTalk) return;
    // 대화 중복 실행 방지: 이미 대화 진행 중이면 무시
    if (this._isDialogueActive) return;
    // 관장자는 guardianUnlocked 상태에서만 클릭 가능
    if (npc.isGuardian && !this._guardianUnlocked) return;
    // S1/S2: final hero는 finalHeroUnlocked 상태에서만 클릭 가능
    if (stageNum === 1 && npc.characterId === this._finalHeroId && !this._finalHeroUnlocked) return;
    // S2 테크 영웅: 두 번째 대화(관장자 후)만 unlocked 필요. 첫 대화는 일반처럼 허용
    if (stageNum === 2 && npc.characterId === this._finalHeroId && npc.hasSpoken && !this._finalHeroUnlocked) return;
    // S2~S5: 순서 무관 — 아직 대화 안 한 영웅이면 누구에게나 말 걸기 허용 (S2 final hero 2차 대화는 위 s2FinalTalk에서 허용)
    const targetY = npc.y + 40;
    this.player.walkTo(npc.x, targetY, () => this._startDialogue(npc));
  }

  /** NPC 접근 판정 — 말 걸어야 할 영웅(또는 관장자)에만 느낌표 표시 */
  _updateNearestNPC() {
    if (!this.gameMap || !this.player || this.player.canMove === false) return;
    const job = this.engine.state.get('selectedJob');
    const allyOrder = job ? ALLY_ORDER[job] : [];
    const stageNum = this.stageManager.getCurrentStage();

    // 디버깅 로그 (상태 변경 시만 출력)
    if (stageNum === 1 || stageNum === 5) {
      const currentState = `${stageNum}-${this._heroTalkedCount}-${this._guardianUnlocked}-${this._finalHeroUnlocked}`;
      if (this._lastDebugState !== currentState) {
        console.log(`[NPC Update] Stage ${stageNum}, heroTalkedCount: ${this._heroTalkedCount}, guardianUnlocked: ${this._guardianUnlocked}, finalHeroUnlocked: ${this._finalHeroUnlocked}`);
        this._lastDebugState = currentState;
      }
    }

    let nearest = null;
    let minDist = Infinity;
    const s2FinalHeroAvailable = (stageNum === 2 && this._finalHeroUnlocked && !this._decisionTriggered);
    for (const npc of this.npcs) {
      const isS2FinalHero = (stageNum === 2 && npc.characterId === this._finalHeroId);
      if (npc.hasSpoken && !(isS2FinalHero && s2FinalHeroAvailable)) {
        npc.showInteractionHint(false);
        continue;
      }
      // 관장자는 unlocked 아니면 느낌표 숨김
      if (npc.isGuardian && !this._guardianUnlocked) {
        npc.showInteractionHint(false);
        continue;
      }
      // S1: final hero는 관장자 대화 전까지 느낌표 숨김
      // S2: final hero는 '첫 대화(4명 돌기)' 때는 말풍선 표시, 관장자 후 두 번째 대화만 unlocked 후 표시
      if (stageNum === 1 && npc.characterId === this._finalHeroId && !this._finalHeroUnlocked) {
        npc.showInteractionHint(false);
        continue;
      }
      if (stageNum === 2 && npc.characterId === this._finalHeroId && npc.hasSpoken && !this._finalHeroUnlocked) {
        npc.showInteractionHint(false);
        continue;
      }

      const inRange = npc.isPlayerInRange(this.player.x, this.player.y);

      // 말 걸어야 할 NPC 판단
      let isExpectedNext = false;
      if (npc.isGuardian) {
        // 관장자: unlocked 상태면 대화 가능
        isExpectedNext = this._guardianUnlocked;
      } else if (stageNum === 1 && npc.characterId === this._finalHeroId) {
        isExpectedNext = this._finalHeroUnlocked;
      } else if (stageNum === 2 && npc.characterId === this._finalHeroId) {
        // S2 테크 영웅: 아직 첫 대화 안 했으면 말풍선 O, 관장자 후 두 번째 대화도 O
        isExpectedNext = !npc.hasSpoken || (this._finalHeroUnlocked && !this._decisionTriggered);
      } else {
        // 일반 hero
        // S1~S5: 아직 대화 안 한 영웅은 누구에게나 말풍선 (순서 무관). S1만 3명 후 guardian만
        if (stageNum === 1 && this._heroTalkedCount >= 3) {
          isExpectedNext = false;
        } else {
          isExpectedNext = true;
        }
      }

      npc.showInteractionHint(isExpectedNext);

      if (!inRange || !isExpectedNext) continue;
      const dx = this.player.x - npc.x;
      const dy = this.player.y - npc.y;
      const d = dx * dx + dy * dy;
      if (d < minDist) {
        minDist = d;
        nearest = npc;
      }
    }
    this._nearestNPC = nearest;
    if (this._interactionHintEl) {
      this._interactionHintEl.style.display = nearest ? 'block' : 'none';
      if (nearest) this._interactionHintEl.textContent = `클릭 또는 Space: ${nearest.name}와 대화`;
    }
  }

  _startDialogue(npc) {
    if (!npc || !this.player) return;
    console.log(`[대화 시작] ${npc.name} (${npc.characterId}) - 현재 heroTalkedCount: ${this._heroTalkedCount}`);
    this.player.canMove = false;
    this._nearestNPC = null;
    if (this._interactionHintEl) this._interactionHintEl.style.display = 'none';
    this._onNPCDialogueStart(npc);
  }

  _onNPCDialogueStart(npc) {
    if (!this.dialogueManager || !npc.dialogueId) {
      npc.onDialogueComplete();
      this.player.canMove = true;
      return;
    }

    const stageNum = this.stageManager.getCurrentStage();

    // S1/S2 final hero 대화는 S1_FINAL_ / S2_FINAL_{characterId} 사용
    let dialogueId = npc.dialogueId;
    if (stageNum === 1 && npc.characterId === this._finalHeroId && this._finalHeroUnlocked) {
      dialogueId = `S1_FINAL_${npc.characterId}`;
    } else if (stageNum === 2 && npc.characterId === this._finalHeroId && this._finalHeroUnlocked) {
      dialogueId = `S2_FINAL_${npc.characterId}`;
    }

    this.dialogueManager.start(dialogueId);
    this._runDialogueFlow(npc);
  }

  _getPortraitForSpeaker(speaker) {
    const role = ROLES.find((r) => r.name === speaker);
    return role?.imagePath ?? null;
  }

  _getPortraitForNpc(npc) {
    if (!npc) return null;
    // 영웅 NPC — characterId로 캐릭터 portrait
    if (npc.characterId) {
      const char = CHARACTERS[npc.characterId];
      return char?.sprites?.portrait ?? null;
    }
    // 관장자 NPC — 맵은 전신(idle), 대화창은 상반신(portrait) 사용
    if (npc.isGuardian) {
      return getGuardianPortrait(npc.name);
    }
    return null;
  }

  /** 아이템 획득 팝업 표시 */
  async _showItemPopup(itemName, itemDesc, itemImgSrc) {
    return new Promise((resolve) => {
      const container = this._rightArea ?? this.domRoot ?? document.body;
      const popup = document.createElement('div');
      popup.className = 'item-popup-overlay';
      popup.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:50;pointer-events:auto;background:rgba(0,0,0,0.5);';

      const imgHtml = itemImgSrc
        ? `<img src="${itemImgSrc}" alt="${itemName}" style="width:80px;height:80px;object-fit:contain;margin-bottom:12px;" onerror="this.style.display='none';">`
        : '';

      popup.innerHTML = `
        <div class="item-popup-card" style="
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 2px solid #d4af37;
          border-radius: 16px;
          padding: 28px 36px;
          text-align: center;
          min-width: 280px;
          box-shadow: 0 0 30px rgba(212,175,55,0.4);
          transform: scale(0.5);
          opacity: 0;
          transition: transform 0.3s ease-out, opacity 0.3s ease-out;
        ">
          <div style="font-size:20px;color:#FFD700;margin-bottom:16px;font-weight:700;">✨ 아이템 획득! ✨</div>
          ${imgHtml}
          <div style="font-size:18px;color:#fff;font-weight:700;margin-bottom:8px;">"${itemName}"</div>
          <div style="font-size:14px;color:#ccc;margin-bottom:20px;">${itemDesc}</div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
            <button class="item-popup-confirm" style="background:linear-gradient(135deg,#d4af37,#f0c040);color:#1a1a2e;border:none;padding:10px 32px;border-radius:8px;font-size:16px;font-weight:700;cursor:pointer;">확인</button>
            <button type="button" class="game-skip-btn" style="padding:10px 24px;font-size:14px;font-weight:600;color:#fff;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.5);border-radius:8px;cursor:pointer;">스킵</button>
          </div>
        </div>
      `;
      container.appendChild(popup);

      // Animate in
      requestAnimationFrame(() => {
        const card = popup.querySelector('.item-popup-card');
        if (card) {
          card.style.transform = 'scale(1)';
          card.style.opacity = '1';
        }
      });

      const closePopup = () => {
        popup.remove();
        resolve();
      };
      popup.querySelector('.item-popup-confirm').addEventListener('click', closePopup);
      popup.querySelector('.game-skip-btn')?.addEventListener('click', closePopup);
    });
  }

  /** 5개 아이템 모두 획득 시 — 필살마법 발휘 가능 메시지 + 캐릭터 빛나는 효과 */
  async _showAllItemsAcquiredEffect() {
    const container = this._rightArea ?? this.domRoot ?? document.body;
    this.screenEffects?.flash('#FFD700', 600);
    await new Promise((r) => setTimeout(r, 400));

    const overlay = document.createElement('div');
    overlay.className = 'all-items-acquired-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:60;pointer-events:auto;background:rgba(0,0,0,0.75);';

    const glowRing = document.createElement('div');
    glowRing.className = 'all-items-glow-ring';
    glowRing.style.cssText = `
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      width: 200px; height: 200px; border-radius: 50%;
      background: radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,165,0,0.2) 40%, transparent 70%);
      box-shadow: 0 0 80px rgba(255,215,0,0.6), 0 0 120px rgba(255,165,0,0.3);
      animation: all-items-glow-pulse 1.2s ease-in-out infinite;
    `;

    const msgBox = document.createElement('div');
    msgBox.className = 'all-items-message';
    msgBox.style.cssText = `
      position: relative; z-index: 2; text-align: center; padding: 32px 48px; max-width: 520px;
      background: linear-gradient(135deg, rgba(26,26,46,0.95) 0%, rgba(22,33,62,0.95) 100%);
      border: 2px solid rgba(255,215,0,0.7); border-radius: 16px;
      box-shadow: 0 0 40px rgba(255,215,0,0.3), inset 0 0 60px rgba(255,215,0,0.08);
    `;
    msgBox.innerHTML = `
      <div style="font-size:15px;color:#FFD700;margin-bottom:12px;letter-spacing:0.05em;">✨ 필살마법 해금 ✨</div>
      <div class="all-items-message-text" style="font-size:18px;line-height:1.6;color:#fff;font-weight:600;">
        장애를 물리칠 수 있는 아이템을 모두 획득하여<br>필살마법을 발휘할 수 있게 됩니다.
      </div>
      <div style="margin-top:20px;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;">
        <span style="font-size:13px;color:rgba(255,255,255,0.7);">Space 또는 클릭으로 진행</span>
        <button type="button" class="game-skip-btn" style="padding:8px 20px;font-size:14px;font-weight:600;color:#1a1510;background:linear-gradient(135deg,#d4af37,#b8860b);border:none;border-radius:8px;cursor:pointer;">스킵</button>
      </div>
    `;

    overlay.appendChild(glowRing);
    overlay.appendChild(msgBox);
    container.appendChild(overlay);

    let resolveDone = null;
    const promise = new Promise((resolve) => {
      resolveDone = resolve;
    });
    const close = () => {
      overlay.remove();
      window.removeEventListener('keydown', keyHandler);
      if (resolveDone) resolveDone();
    };
    const keyHandler = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        close();
      }
    };
    overlay.addEventListener('click', (e) => {
      if (e.target.closest('.game-skip-btn')) return;
      close();
    });
    msgBox.querySelector('.game-skip-btn')?.addEventListener('click', close);
    window.addEventListener('keydown', keyHandler);
    await promise;
  }

  async _runDialogueFlow(npc) {
    // 대화 중복 실행 방지 플래그 설정
    this._isDialogueActive = true;

    const dm = this.dialogueManager;
    const box = this.dialogueBox;
    const panel = this.choicePanel;
    const spaceHandler = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        box.advance();
      }
    };
    window.addEventListener('keydown', spaceHandler);

    try {
      while (!dm.isFinished()) {
        let step = dm.currentStep();
        if (!step) break;

        if (step.type === 'dialogue') {
          const portrait = this._getPortraitForNpc(npc) || this._getPortraitForSpeaker(step.speaker);
          box.showText(step.speaker, step.text, portrait);
          await box.waitForAdvance();
          dm.advance();
          box.hide();
          continue;
        }

        if (step.type === 'choice') {
          panel.show(step.choices);
          const choice = await new Promise((resolve) => {
            this._resolveChoice = resolve;
          });
          panel.hide();
          this._resolveChoice = null;
          if (choice?.checkpoint) {
            const ok = await this._confirmCheckpoint(choice);
            if (!ok) {
              continue;
            }
          }
          const chaosBefore = this.engine.state.get('internalChaos') ?? 0;
          const extBefore = this.engine.state.get('externalRisk') ?? 0;
          dm.selectChoice(choice);
          const chaosAfter = this.engine.state.get('internalChaos') ?? 0;
          const extAfter = this.engine.state.get('externalRisk') ?? 0;
          const dChaos = chaosAfter - chaosBefore;
          const dExt = extAfter - extBefore;
          this._showRiskDelta(dChaos, dExt);
          const charName = npc?.name ?? '선택';
          const narration = this._getChoiceNarration(charName, dChaos, dExt);
          if (narration) {
            box.showTextInstant('시스템', narration, null);
            await box.waitForAdvance();
            box.hide();
          }
          if (choice?.effects && (choice.effects.internalChaos > 0 || choice.effects.externalRisk > 0)) {
            this.effectManager?.play('DANGER_SPARK');
            this.screenEffects?.shake(400);
            this.screenEffects?.redFlash(400);
          } else if (choice?.effects && (dChaos < 0 || dExt < 0)) {
            this.screenEffects?.flash('rgba(46, 204, 113, 0.25)', 200);
          }
          step = dm.currentStep();
          if (step?.type === 'response') {
            const resp = dm.getResponseForChoice(step);
            if (resp) {
              const portrait = this._getPortraitForNpc(npc) || this._getPortraitForSpeaker(resp.speaker);
              box.showTextInstant(resp.speaker, resp.text, portrait);
              await box.waitForAdvance();
              dm.advance();
            }
          }
          box.hide();
          this._updateRiskBars();
          continue;
        }

        if (step.type === 'response') {
          const resp = dm.getResponseForChoice(step);
          if (resp) {
            const portrait = this._getPortraitForNpc(npc) || this._getPortraitForSpeaker(resp.speaker);
            box.showTextInstant(resp.speaker, resp.text, portrait);
            await box.waitForAdvance();
          }
          dm.advance();
          box.hide();
          continue;
        }

        if (step.type === 'item_reward') {
          // 아이템 획득: S1, S2(초기공지)=대화만, S3(심화) 2개 + S4(복구) 1개 + S5(후속) 1개 = 총 5개 (기본 1개 포함)
          const stage = this.stageManager.getCurrentStage();
          if (stage < 3) {
            // S1, S2는 아이템 없이 대화만
            dm.advance();
            continue;
          }
          const itemsNow = this.engine.state.get('items') ?? [true, false, false, false, false];
          const itemSourcesNow = this.engine.state.get('itemSources') ?? [this.engine.state.get('selectedJob'), null, null, null, null];
          const count = itemsNow.filter(Boolean).length;
          const allowS3 = stage === 3 && count < 3;
          const allowS4 = stage === 4 && count < 4;
          const allowS5 = stage === 5 && count < 5;
          const alreadyFromThisChar = npc.characterId && itemSourcesNow.includes(npc.characterId);
          if (!allowS3 && !allowS4 && !allowS5) {
            dm.advance();
            continue;
          }
          // 같은 캐릭터에게서는 한 번만 획득 (중복 방지)
          if (alreadyFromThisChar) {
            dm.advance();
            continue;
          }
          const itemName = step.itemName ?? '아이템';
          const itemDesc = step.itemDesc ?? '';
          const text = step.text ?? '아이템을 획득했습니다.';

          // 이펙트 조합
          this.screenEffects?.playSkillEffect();
          this.screenEffects?.flash('#FFD700', 400);
          this.effectManager?.play('ITEM_FUSION');

          // 0.3초 딜레이 후 팝업
          await new Promise((r) => setTimeout(r, 300));

          const itemImg = npc.characterId ? getItemImage(npc.characterId, 0) : null;
          await this._showItemPopup(itemName, itemDesc, itemImg);

          // 아이템 슬롯 순차 추가: 캐릭터당 1종만 저장 → 5종 완성
          const items = this.engine.state.get('items') ?? [true, false, false, false, false];
          const itemSources = this.engine.state.get('itemSources') ?? [this.engine.state.get('selectedJob'), null, null, null, null];
          const idx = items.findIndex((filled, i) => !filled && i > 0);
          if (idx !== -1 && npc.characterId) {
            items[idx] = true;
            itemSources[idx] = npc.characterId;
            this.engine.state.set({ items, itemSources });
            this._updateItemSlots();
            // 5개 모두 모으면 필살마법 연출
            if (items.every(Boolean)) {
              await this._showAllItemsAcquiredEffect();
            }
          }
          dm.advance();
          continue;
        }

        dm.advance();
      }
    } finally {
      window.removeEventListener('keydown', spaceHandler);
    }

    console.log(`[대화 플로우 종료] ${npc.name} (${npc.characterId}) - hasSpoken 설정 전`);
    npc.onDialogueComplete();
    console.log(`[대화 플로우 종료] hasSpoken=${npc.hasSpoken} 설정 완료`);
    this.player.canMove = true;
    this.dialogueBox.hide();
    this.choicePanel.hide();
    const stageBefore = this.stageManager.getCurrentStage();
    this.engine.state.applyStageBaseDrift(stageBefore);
    this.stageManager.advanceTime(5);
    this._updateRiskBars();

    // 영웅 대화 완료 카운트 및 플로우 진행
    const stageNum = this.stageManager.getCurrentStage();

    if (!npc.isGuardian) {
      // S2: 테크영웅 '두 번째' 대화(관장자 후, "빠른 시간 내에 복구는 어려울 것 같습니다") 후에만 → 선택지로 직행
      if (stageNum === 2 && npc.characterId === this._finalHeroId && this._finalHeroUnlocked) {
        this._decisionTriggered = true;
        await this._triggerDecision();
        this._isDialogueActive = false;
        return;
      }

      console.log(`[카운트 증가 전] ${npc.name} - 현재: ${this._heroTalkedCount} → 증가 후: ${this._heroTalkedCount + 1}`);
      this._heroTalkedCount++;

      // 디버깅: 대화 완료 카운트 로그
      if (stageNum === 1 || stageNum === 5) {
        console.log(`[대화 완료] ${npc.name} (${npc.characterId}) → heroTalkedCount: ${this._heroTalkedCount}`);
      }

      // S1: 3명 대화 후 관장자 unlock
      if (stageNum === 1 && this._heroTalkedCount === 3 && !this._guardianUnlocked) {
        await this._showGuardianPrompt();
        this._isDialogueActive = false;
        return;
      }

      // S1: final hero 대화 후 DECISION
      if (stageNum === 1 && npc.characterId === this._finalHeroId && !this._decisionTriggered) {
        this._decisionTriggered = true;
        await this._triggerDecision();
        this._isDialogueActive = false;
        return;
      }

      // S2 이상: 모든 hero 대화 후 guardian 또는 DECISION
      const heroNpcs = this.npcs.filter(n => !n.isGuardian);
      const allHeroesSpoken = heroNpcs.every(n => n.hasSpoken);
      if (stageNum >= 2 && allHeroesSpoken && !this._decisionTriggered) {
        this._decisionTriggered = true;
        const guardianNpc = this.npcs.find(n => n.isGuardian);
        if (guardianNpc) {
          await this._showGuardianPrompt();
        } else {
          await this._triggerDecision();
        }
      }
    } else {
      // 관장자 대화 완료
      if (stageNum === 1) {
        await this._unlockFinalHero();
      } else if (stageNum === 2) {
        // S2: 관장자 대화 후 바로 선택지 (다른 스테이지와 동일)
        await this._triggerDecision();
      } else {
        // S3 이상: DECISION
        await this._triggerDecision();
      }
    }

    // 대화 플로우 완전 종료 - 플래그 해제
    this._isDialogueActive = false;
  }

  /** S1/S2: 관장자 대화 후 final hero unlock */
  async _unlockFinalHero() {
    this.player.canMove = false;
    // 영웅 NPC만 대상 (관장자 제외). 테크리더 플레이 시 techCommunicator, 테크커뮤니케이터 플레이 시 techLeader
    const finalHeroNpc = this.npcs.find(n => !n.isGuardian && n.characterId === this._finalHeroId);
    if (!finalHeroNpc) {
      console.warn('[S2] 테크 영웅 NPC를 찾지 못함. _finalHeroId=', this._finalHeroId, 'npcs=', this.npcs.map(n => ({ id: n.id, characterId: n.characterId, isGuardian: n.isGuardian })));
      this.player.canMove = true;
      return;
    }

    const stageNum = this.stageManager.getCurrentStage();
    const promptText = stageNum === 2 ? '테크영웅에게 찾아가보세요.' : `${CHARACTERS[this._finalHeroId]?.name || '동료'}와 대화해보세요.`;
    this.dialogueBox.showTextInstant('시스템', promptText, null);
    const advanceHandler = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        this.dialogueBox.advance();
      }
    };
    window.addEventListener('keydown', advanceHandler);
    await this.dialogueBox.waitForAdvance();
    window.removeEventListener('keydown', advanceHandler);
    this.dialogueBox.hide();

    this._finalHeroUnlocked = true;
    finalHeroNpc.showInteractionHint(true); // 관장자 대화 직후 테크 영웅 말풍선 즉시 표시
    this.screenEffects?.flash('rgba(255, 255, 255, 0.6)', 200);
    this.effectManager?.play('HERO_GLOW', finalHeroNpc.x, finalHeroNpc.y);
    this.screenEffects?.calmGlow(300);
    this.player.canMove = true;
  }

  /** 영웅 대화 완료 시 — 관장자 안내 메시지 표시 후 잠금 해제 */
  async _showGuardianPrompt() {
    this.player.canMove = false;
    this.dialogueBox.showTextInstant('시스템', '모든 동료와 대화를 마쳤습니다.\n관장자와 대화해보시겠습니까?', null);
    const advanceHandler = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        this.dialogueBox.advance();
      }
    };
    window.addEventListener('keydown', advanceHandler);
    await this.dialogueBox.waitForAdvance();
    window.removeEventListener('keydown', advanceHandler);
    this.dialogueBox.hide();

    this._guardianUnlocked = true;
    const guardianNpc = this.npcs.find(n => n.isGuardian);
    if (guardianNpc) {
      this.screenEffects?.flash('rgba(255, 255, 255, 0.6)', 200);
      this.effectManager?.play('HERO_GLOW', guardianNpc.x, guardianNpc.y);
      this.screenEffects?.calmGlow(300);
    }
    this.player.canMove = true;
  }

  /** 결정 대화(선택지) 실행 → 완료 후 스테이지 전환 */
  async _triggerDecision() {
    const stageNum = this.stageManager.getCurrentStage();
    const decisionId = `S${stageNum}_DECISION`;

    if (!this.dialoguesData?.dialogues?.[decisionId]) {
      await this._transitionToNextStage();
      return;
    }

    this.player.canMove = false;

    // 약간의 딜레이
    await new Promise(r => setTimeout(r, 500));

    this.dialogueManager.start(decisionId);

    const dm = this.dialogueManager;
    const box = this.dialogueBox;
    const panel = this.choicePanel;
    const spaceHandler = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        box.advance();
      }
    };
    window.addEventListener('keydown', spaceHandler);

    try {
      while (!dm.isFinished()) {
        let step = dm.currentStep();
        if (!step) break;

        if (step.type === 'dialogue') {
          box.showText(step.speaker, step.text, null);
          await box.waitForAdvance();
          dm.advance();
          box.hide();
          continue;
        }

        if (step.type === 'choice') {
          panel.show(step.choices);
          const choice = await new Promise((resolve) => {
            this._resolveChoice = resolve;
          });
          panel.hide();
          this._resolveChoice = null;
          if (choice?.checkpoint) {
            const ok = await this._confirmCheckpoint(choice);
            if (!ok) continue;
          }
          const chaosBefore = this.engine.state.get('internalChaos') ?? 0;
          const extBefore = this.engine.state.get('externalRisk') ?? 0;
          dm.selectChoice(choice);
          const chaosAfter = this.engine.state.get('internalChaos') ?? 0;
          const extAfter = this.engine.state.get('externalRisk') ?? 0;
          const dChaos = chaosAfter - chaosBefore;
          const dExt = extAfter - extBefore;
          this._showRiskDelta(dChaos, dExt);
          const narration = this._getChoiceNarration('선택', dChaos, dExt);
          if (narration) {
            box.showTextInstant('시스템', narration, null);
            await box.waitForAdvance();
            box.hide();
          }
          if (choice?.effects && (choice.effects.internalChaos > 0 || choice.effects.externalRisk > 0)) {
            this.effectManager?.play('DANGER_SPARK');
            this.screenEffects?.shake(400);
            this.screenEffects?.redFlash(400);
          } else if (choice?.effects && (dChaos < 0 || dExt < 0)) {
            this.screenEffects?.flash('rgba(46, 204, 113, 0.25)', 200);
          }
          step = dm.currentStep();
          if (step?.type === 'response') {
            const resp = dm.getResponseForChoice(step);
            if (resp) {
              box.showTextInstant(resp.speaker, resp.text, null);
              await box.waitForAdvance();
              dm.advance();
            }
          }
          box.hide();
          this._updateRiskBars();
          continue;
        }

        if (step.type === 'response') {
          const resp = dm.getResponseForChoice(step);
          if (resp) {
            box.showTextInstant(resp.speaker, resp.text, null);
            await box.waitForAdvance();
          }
          dm.advance();
          box.hide();
          continue;
        }

        dm.advance();
      }
    } finally {
      window.removeEventListener('keydown', spaceHandler);
    }

    box.hide();
    panel.hide();
    this.player.canMove = true;

    // 결정 완료 → 스테이지 전환
    await this._transitionToNextStage();
  }

  async _transitionToNextStage() {
    const stageNum = this.stageManager.getCurrentStage();

    // S5 완료 → 보스전/엔딩
    if (stageNum >= 5) {
      this._goToEnding();
      return;
    }
    const nextNum = stageNum + 1;
    const stageId = 'S' + nextNum;
    const mapData = this.mapsData?.maps?.[stageId];
    if (!mapData) {
      this._goToEnding();
      return;
    }
    const fadeColor = STAGE_FADE_COLORS[nextNum] ?? '#1a2a1a';
    const fadeEl = document.createElement('div');
    fadeEl.style.cssText = `position:fixed;inset:0;background:${fadeColor};opacity:0;z-index:100;pointer-events:none;`;
    this.domRoot?.appendChild(fadeEl);

    if (typeof gsap !== 'undefined') {
      await gsap.to(fadeEl, { opacity: 1, duration: 0.5, ease: 'power2.inOut' });
    } else {
      fadeEl.style.transition = 'opacity 0.5s ease';
      fadeEl.style.opacity = '1';
      await new Promise((r) => setTimeout(r, 500));
    }

    const label = document.createElement('div');
    label.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:24px;z-index:101;pointer-events:none;';
    label.textContent = `Stage ${nextNum} · ${this.stageManager.getStageName(nextNum)}`;
    this.domRoot?.appendChild(label);

    const elapsed = this.engine.state.get('elapsedMinutes') ?? 0;
    // 심화공지판단(S3) 시점 경과시간 1시간 50분(110분)
    const nextElapsed = nextNum === 2 ? 15 : nextNum === 3 ? 110 : nextNum === 4 ? 130 : 200;
    this.engine.state.set({ elapsedMinutes: Math.max(elapsed, nextElapsed), stage: nextNum });
    this.engine.bgm?.playForStage(nextNum);
    const stageNumForBg = this.stageManager.getCurrentStage();
    mapData.background = getGuildBg(stageNumForBg);
    const oldMap = this.gameMap;
    this.gameMap = new GameMap(mapData);
    if (oldMap?.container?.parent) oldMap.container.parent.removeChild(oldMap.container);
    this.player.container.parent?.removeChild(this.player.container);
    const job = this.engine.state.get('selectedJob');
    this.player = new Player(4, job);
    this.player.x = mapData.playerStart?.x ?? 640;
    this.player.y = mapData.playerStart?.y ?? 600;
    this.player.container.x = this.player.x;
    this.player.container.y = this.player.y;
    this.gameMap.playerLayer.addChild(this.player.container);
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
    this.camera.applyTo(this.gameMap.container);

    this._spawnNpcs(mapData, job, nextNum);

    this.engine.pixi.stage.removeChildren();
    this.engine.pixi.stage.addChild(this.gameMap.container);
    if (this.effectManager) this.effectManager.container = this.gameMap.effectLayer;
    this._updateRiskBars();
    this.effectManager?.play('STAGE_DUST', this.gameMap.width / 2, this.gameMap.height / 2);

    if (typeof gsap !== 'undefined') {
      await gsap.to(fadeEl, { opacity: 0, duration: 0.7, ease: 'power2.inOut' });
    } else {
      await new Promise((r) => setTimeout(r, 400));
      fadeEl.style.transition = 'opacity 0.7s ease';
      fadeEl.style.opacity = '0';
      await new Promise((r) => setTimeout(r, 700));
    }
    label.remove();
    fadeEl.remove();
  }

  _onDialogueChoiceSelected(choice) {
    if (this._resolveChoice) {
      this._resolveChoice(choice);
    }
  }

  async _confirmCheckpoint(choice) {
    return new Promise((resolve) => {
      const box = this._rightArea ?? this.domRoot;
      let overlay = box?.querySelector('.checkpoint-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'checkpoint-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:40;pointer-events:auto;';
        box?.appendChild(overlay);
      }
      overlay.innerHTML = `
        <div class="checkpoint-box" style="background:#222;padding:24px;border-radius:12px;max-width:400px;">
          <div class="title" style="font-weight:700;margin-bottom:12px;">결정 확인</div>
          <p class="desc" style="font-size:14px;opacity:0.9;">이대로 진행할까요? 수정해도 불이익은 없습니다.</p>
          <div class="checkpoint-buttons" style="margin-top:16px;display:flex;gap:8px;">
            <button class="btn-edit" id="checkpoint-edit">다른 선택 검토</button>
            <button class="btn-confirm" id="checkpoint-confirm">이대로 진행</button>
          </div>
        </div>
      `;
      overlay.style.display = 'flex';
      overlay.querySelector('#checkpoint-edit').onclick = () => {
        overlay.style.display = 'none';
        resolve(false);
      };
      overlay.querySelector('#checkpoint-confirm').onclick = () => {
        overlay.style.display = 'none';
        resolve(true);
      };
    });
  }

  _onSpace() {
    // DOM fallback — not used in PixiJS map mode
  }

  _startVillageLoop() {
    const loop = () => {
      this._villLoopId = requestAnimationFrame(loop);
      if (this.gameMap && this.player && this.camera) {
        this.player.update(this.engine.input);
        const mw = this.gameMap.width;
        const mh = this.gameMap.height;
        const halfW = 32;
        const halfH = 48;
        this.player.x = Math.max(halfW, Math.min(mw - halfW, this.player.x));
        this.player.y = Math.max(halfH, Math.min(mh - halfH, this.player.y));
        this.player.container.x = this.player.x;
        this.player.container.y = this.player.y;
        this.camera.follow(this.player.x, this.player.y);
        this.camera.clamp(mw, mh);
        this.camera.applyTo(this.gameMap.container);
        this.gameMap.updateParallax(this.camera.x, this.camera.y);
        this._updateNearestNPC();
        if (this.engine.input?.isKeyJustPressed('Space') && this._nearestNPC) {
          this._startDialogue(this._nearestNPC);
        }
      }
      if (this.engine.input) this.engine.input.clearJustPressed();
      if (this._villageWrap && this._playerEl) {
        const w = this._villageWrap.offsetWidth || 400;
        const h = this._villageWrap.offsetHeight || 300;
        let dx = 0, dy = 0;
        if (this.keys['ArrowLeft']) { dx = -1; this.playerX = Math.max(PLAYER_HALF, this.playerX - PLAYER_SPEED); }
        if (this.keys['ArrowRight']) { dx = 1; this.playerX = Math.min(w - PLAYER_HALF, this.playerX + PLAYER_SPEED); }
        if (this.keys['ArrowUp']) { dy = -1; this.playerY = Math.max(PLAYER_HALF, this.playerY - PLAYER_SPEED); }
        if (this.keys['ArrowDown']) { dy = 1; this.playerY = Math.min(h - PLAYER_HALF, this.playerY + PLAYER_SPEED); }

        const isMoving = dx !== 0 || dy !== 0;

        if (dy < 0) this._facing = 'Up';
        else if (dy > 0) this._facing = 'Down';
        else if (dx < 0) this._facing = 'Left';
        else if (dx > 0) this._facing = 'Right';
        else this._facing = 'idle';

        this._updateGamePlayerSprite(isMoving);
        this._playerEl.style.left = this.playerX + 'px';
        this._playerEl.style.top = this.playerY + 'px';
        this._playerEl.classList.toggle('moving', isMoving);
      }
    };
    loop();
  }

  _updateGamePlayerSprite(isMoving) {
    const char = this._playerChar;
    if (!char?.sprites || !this._playerImg) return;

    let spriteKey = 'idle';
    this._flipX = false;

    if (this._facing !== 'idle' && isMoving) {
      if (this._facing === 'Up') {
        spriteKey = 'walkUp';
      } else if (this._facing === 'Down') {
        spriteKey = 'walkDown';
      } else if (this._facing === 'Left') {
        if (char.sprites.walkLeft && char.sprites.walkLeft !== char.sprites.idle) {
          spriteKey = 'walkLeft';
        } else {
          spriteKey = 'walkRight';
          this._flipX = true;
        }
      } else if (this._facing === 'Right') {
        spriteKey = 'walkRight';
      }
    }

    const src = char.sprites[spriteKey] || char.sprites.idle;
    const currentSrc = (this._playerImg.src || '').split('#')[0].split('?')[0];
    const newSrc = src.split('#')[0].split('?')[0];

    if (currentSrc !== newSrc && !currentSrc.endsWith(newSrc)) {
      this._playerImg.src = src;
    }

    this._playerImg.style.transform = this._flipX ? 'scaleX(-1)' : '';
    this._playerImg.classList.toggle('flip-x', this._flipX);
  }

  _updateStageColorOverlay() {
    if (!this._stageColorOverlay) return;
    const stageNum = this.stageManager.getCurrentStage();
    const color = STAGE_COLOR_OVERLAYS[stageNum] ?? STAGE_COLOR_OVERLAYS[1];
    this._stageColorOverlay.style.transition = 'background-color 0.8s ease';
    this._stageColorOverlay.style.backgroundColor = color;
  }

  _getRiskGradeColor(percent) {
    if (percent >= 75) return '#e74c3c';
    if (percent >= 50) return '#f39c12';
    if (percent >= 25) return '#f1c40f';
    return '#2ecc71';
  }

  _updateRiskBars() {
    this._updateStageColorOverlay();
    const c = this.engine.state.get('internalChaos') ?? 0;
    const e = this.engine.state.get('externalRisk') ?? 0;
    const chaosLabel = document.getElementById('risk-chaos-label');
    const extLabel = document.getElementById('risk-external-label');
    const chaosBar = document.getElementById('risk-chaos-bar');
    const extBar = document.getElementById('risk-external-bar');
    if (chaosLabel) {
      chaosLabel.textContent = this.riskGauge.getChaosLabel(c);
      chaosLabel.style.color = this._getRiskGradeColor(c);
    }
    if (extLabel) {
      extLabel.textContent = this.riskGauge.getExternalLabel(e);
      extLabel.style.color = this._getRiskGradeColor(e);
    }
    if (chaosBar) chaosBar.style.width = c + '%';
    if (extBar) extBar.style.width = e + '%';
    const stageNum = this.stageManager.getCurrentStage();
    const stageName = this.stageManager.getStageName(stageNum);
    const elapsed = this.engine.state.get('elapsedMinutes');
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    const timeEl = document.getElementById('hud-time');
    const nameEl = document.getElementById('hud-stage-name');
    if (timeEl) timeEl.textContent = `경과 ${mm}:${ss}`;
    if (nameEl) {
      nameEl.textContent = stageName;
      nameEl.setAttribute('data-stage-num', String(stageNum));
    }
    this.domRoot?.querySelectorAll('.stage-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i + 1 === stageNum);
    });
  }

  /** 선택에 따른 나레이션: 장애 심화 / 캐릭터 대응으로 증가·감소 설명 */
  _getChoiceNarration(charName, dChaos, dExt) {
    const hasDown = dChaos < 0 || dExt < 0;
    const hasUp = dChaos > 0 || dExt > 0;
    if (hasDown && !hasUp) {
      return `장애 심화에 따른 조직위험도가 반영되었습니다. ${charName}의 대응으로 조직혼란도와 대외위험이 감소되었습니다.`;
    }
    if (hasUp) {
      return '장애 심화에 따른 조직위험도가 증가하였습니다. 선택에 따라 조직혼란도와 대외위험이 다소 증가하였습니다.';
    }
    return `장애 심화에 따른 조직위험도가 반영되었습니다. ${charName}의 대응으로 위험도가 유지되었습니다.`;
  }

  /** 상단 리스크 바에 +/- 변화량 눈에 띄게 표시, 바 강조 연출 */
  _showRiskDelta(dChaos, dExt) {
    const bar = document.getElementById('game-risk-top-bar');
    if (!bar) return;
    const chaosHalf = bar.querySelector('.risk-half.chaos');
    const extHalf = bar.querySelector('.risk-half.external');
    const chaosBarEl = bar.querySelector('#risk-chaos-bar');
    const extBarEl = bar.querySelector('#risk-external-bar');
    const show = (halfEl, delta, barEl) => {
      if (!halfEl || delta === 0) return;
      const valueEl = halfEl.querySelector('.risk-value');
      const span = document.createElement('span');
      span.className = 'risk-delta ' + (delta > 0 ? 'risk-delta-up' : 'risk-delta-down');
      span.textContent = delta > 0 ? ` +${delta}` : ` ${delta}`;
      if (valueEl) valueEl.insertAdjacentElement('afterend', span);
      else halfEl.appendChild(span);
      if (barEl) {
        barEl.classList.remove('risk-bar-just-changed', 'risk-bar-just-down');
        barEl.classList.add(delta > 0 ? 'risk-bar-just-changed' : 'risk-bar-just-down');
        setTimeout(() => barEl.classList.remove('risk-bar-just-changed', 'risk-bar-just-down'), 700);
      }
      setTimeout(() => span.classList.add('risk-delta-out'), 800);
      setTimeout(() => span.remove(), 3500);
    };
    show(chaosHalf, dChaos, chaosBarEl);
    show(extHalf, dExt, extBarEl);
  }

  _showBottomSituation() {
    if (this.stepIndex >= SCENARIO_STEPS.length) {
      this._goToEnding();
      return;
    }
    const step = SCENARIO_STEPS[this.stepIndex];
    const choices = step.choiceIds
      .map((id) => this.choiceSystem.getChoiceById(id))
      .filter(Boolean);

    let bottom = this._rightArea?.querySelector('.bottom-panel');
    if (!bottom) {
      bottom = document.createElement('div');
      bottom.className = 'bottom-panel';
      bottom.style.pointerEvents = 'auto';
      this._rightArea?.appendChild(bottom);
    }
    const elapsed = this.engine.state.get('elapsedMinutes');
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    bottom.innerHTML = `
      <div class="bottom-situation">
        <div class="bottom-title">${step.title}</div>
        <div class="bottom-meta">경과 ${mm}:${ss}분</div>
        <div class="choices-list" id="choices-list"></div>
      </div>
    `;
    const list = bottom.querySelector('#choices-list');
    choices.forEach((choice) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice.text;
      btn.dataset.choiceId = choice.id;
      btn.addEventListener('click', () => this._onChoice(choice.id));
      list.appendChild(btn);
    });
  }

  _onChoice(choiceId) {
    const choice = this.choiceSystem.getChoiceById(choiceId);
    if (!choice) return;
    if (choice.checkpoint && !this.pendingCheckpoint) {
      this.pendingCheckpoint = choiceId;
      this._showCheckpointOverlay(choice);
      return;
    }
    this._applyChoice(choiceId).catch(() => {});
  }

  _showCheckpointOverlay(choice) {
    const container = this._rightArea ?? this.domRoot;
    let box = container.querySelector('.checkpoint-overlay');
    if (!box) {
      box = document.createElement('div');
      box.className = 'checkpoint-overlay';
      box.style.pointerEvents = 'auto';
      container.appendChild(box);
    }
    box.innerHTML = `
      <div class="checkpoint-box">
        <div class="title">결정 확인</div>
        <p class="desc">이대로 진행할까요? 수정해도 불이익은 없습니다.</p>
        <div class="checkpoint-buttons">
          <button class="btn-edit" id="checkpoint-edit">결정 수정</button>
          <button class="btn-confirm" id="checkpoint-confirm">이대로 진행</button>
        </div>
      </div>
    `;
    box.style.display = 'flex';
    box.querySelector('#checkpoint-edit').addEventListener('click', () => {
      this.pendingCheckpoint = null;
      box.style.display = 'none';
    });
    box.querySelector('#checkpoint-confirm').addEventListener('click', () => {
      this.pendingCheckpoint = null;
      box.style.display = 'none';
      this._applyChoice(choice.id).catch(() => {});
    });
  }

  async _applyChoice(choiceId) {
    const result = this.choiceSystem.applyChoice(choiceId);
    if (!result) return;
    const { choice, internalDelta, externalDelta, promiseRisk } = result;
    this.choiceSystem.logChoice(choiceId, choice.text);
    if (choice.scopeClarity) {
      this.engine.state.set({
        scopeClarityScore: (this.engine.state.get('scopeClarityScore') ?? 0) + choice.scopeClarity,
      });
    }
    this.riskGauge.applyDelta(internalDelta, externalDelta, promiseRisk);
    if ((internalDelta ?? 0) > 0 || (externalDelta ?? 0) > 0) {
      this.screenEffects?.shake(400);
      this.screenEffects?.redFlash(400);
    }
    this.stageManager.advanceTime(5);
    this._updateRiskBars();
    this.stepIndex++;
    this._showBottomSituation();
  }

  _updateItemSlots() {
    const items = this.engine.state.get('items') ?? [true, false, false, false, false];
    const itemSources = this.engine.state.get('itemSources') ?? [null, null, null, null, null];
    const job = this.engine.state.get('selectedJob');
    const role = ROLES.find((r) => r.id === job);
    const container = document.getElementById('game-item-slots') ?? this._leftPanel?.querySelector('#game-item-slots') ?? this.domRoot?.querySelector('#game-item-slots');
    if (!container) return;
    container.innerHTML = this._renderItemSlots(items, itemSources, role);
  }

  /**
   * NPC→캐릭터 매핑은 이제 _spawnNpcs에서 직접 처리.
   * 이 함수는 호환성을 위해 유지 (빈 객체 반환).
   */
  _buildNpcCharMapping(selectedJob) {
    return {};
  }

  /** 후속조치 완료 후: 보스전(영웅들이 힘을 모읍니다 → magic.mp4 → 빛의 검 → 격파) → 엔딩(평화) → 종료 */
  _goToEnding() {
    const grade = this.endingEvaluator.evaluate();
    this.engine.state.set({ endingGrade: grade });
    this.engine.sceneManager.goTo('boss');
  }

  async exit() {
    if (this._villLoopId != null) cancelAnimationFrame(this._villLoopId);
    this._keyCleanup?.();
    clearTimeout(this._speechBubbleTimer);
    const riskBar = document.getElementById('game-risk-top-bar');
    if (riskBar) {
      riskBar.innerHTML = '';
      riskBar.style.display = 'none';
    }
    if (this._leftPanel?.parentNode) this._leftPanel.parentNode.removeChild(this._leftPanel);
    this._leftPanel = null;
    if (this.domRoot?.parentNode) this.domRoot.parentNode.removeChild(this.domRoot);
    this.engine.pixi.stage.removeChildren();
  }
}
