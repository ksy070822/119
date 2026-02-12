/**
 * 컨트롤센터 집결 (v3) — 5명 배치, 인트로 대화, 동료 순서대로 상담 → 선택 → 아이템 → 스테이지 전환 → 최종
 */
import { CHARACTERS, INTRO_ORDER, ALLY_ORDER } from '../data/characters.js';
import { DIALOGUES, getDialogueKey } from '../data/dialogues.js';
import { BACKGROUNDS } from '../data/stages.js';
import { getGuildBg, getStageLevelFromAllyIndex, getBossSprite, getRiskLevel, getItemImage } from '../data/assetPaths.js';
import { SpeechBubble } from '../ui/SpeechBubble.js';
import { SystemMessage } from '../ui/SystemMessage.js';
import { ChoicePanel } from '../ui/ChoicePanel.js';
import { StageTransition } from '../ui/StageTransition.js';

export class ControlCenterScene {
  constructor(game) {
    this.game = game;
    this.npcs = {};
    this.introComplete = false;
    this.currentAllyIndex = 0;
    this.domRoot = null;
  }

  async enter() {
    this.domRoot = document.createElement('div');
    this.domRoot.className = 'control-center-scene';
    const indoorBg = BACKGROUNDS.indoorDefault;
    this.domRoot.style.cssText =
      `position:absolute;inset:0;background:url(${indoorBg}) center/cover no-repeat;background-color:#1a1a2e;`;
    const overlay = this.game.uiContainer;
    overlay.innerHTML = '';
    overlay.appendChild(this.domRoot);
    this._resolveWait = null;
    const skipBtn = document.createElement('button');
    skipBtn.type = 'button';
    skipBtn.className = 'scene-skip-btn';
    skipBtn.textContent = '스킵';
    skipBtn.style.cssText = 'position:absolute;top:16px;right:16px;z-index:50;padding:8px 18px;font-size:14px;font-weight:600;color:#1a1510;background:linear-gradient(135deg,#d4af37,#b8860b);border:none;border-radius:8px;cursor:pointer;';
    skipBtn.addEventListener('click', () => {
      if (this._resolveWait) {
        this._resolveWait();
        this._resolveWait = null;
      }
    });
    this.domRoot.appendChild(skipBtn);
    this.placeCharacters();
    if (!this.introComplete) {
      await this.playIntroDialogue();
      this.introComplete = true;
    }
    this.startMainGameLoop();
  }

  placeCharacters() {
    const positions = {
      communicator: { x: 400, y: 300 },
      techLeader: { x: 250, y: 460 },
      techCommunicator: { x: 550, y: 400 },
      controlTower: { x: 200, y: 550 },
      reporter: { x: 600, y: 620 },
    };
    const selectedJob = this.game.state.get('selectedJob');
    const container = document.createElement('div');
    container.className = 'control-center-characters';
    container.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
    this.domRoot.appendChild(container);
    Object.keys(CHARACTERS).forEach((id) => {
      const char = CHARACTERS[id];
      const pos = positions[id];
      const div = document.createElement('div');
      div.className = 'control-center-char';
      div.dataset.charId = id;
      div.style.cssText = `position:absolute;left:${pos.x}px;top:${pos.y}px;width:64px;height:64px;transform:translate(-50%,-50%);border-radius:50%;border:3px solid ${char.color};background:${char.color}33;display:flex;align-items:center;justify-content:center;pointer-events:auto;cursor:pointer;`;
      const img = document.createElement('img');
      img.src = char.sprites?.portrait || '';
      img.alt = char.name;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.borderRadius = '50%';
      img.style.objectFit = 'cover';
      img.onerror = () => { div.style.background = char.color; };
      div.appendChild(img);
      const speechBubble = document.createElement('span');
      speechBubble.className = 'npc-exclamation npc-speech-bubble';
      speechBubble.textContent = '💬';
      speechBubble.style.cssText = 'position:absolute;top:-12px;right:-8px;width:28px;height:28px;background:rgba(255,255,255,0.95);border-radius:50%;display:none;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);';
      div.appendChild(speechBubble);
      container.appendChild(div);
      if (id === selectedJob) {
        this.game.player.x = pos.x;
        this.game.player.y = pos.y;
        this.game.player.element = div;
      } else {
        const npc = this.game.createNPC(id, pos.x, pos.y);
        npc.element = div;
        npc.setExclamationElement(speechBubble);
        this.npcs[id] = npc;
      }
    });
    this.domRoot.appendChild(container);
    container.querySelectorAll('.control-center-char').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.dataset.charId;
        if (this.npcs[id]) this.onNPCInteract(id);
      });
    });
    this._addBossVisual();
    this._renderItemSlots();
  }

  _renderItemSlots() {
    const items = this.game.state.get('items') ?? [true, false, false, false, false];
    const sources = this.game.state.get('itemSources') ?? [this.game.state.get('selectedJob'), null, null, null, null];
    const wrap = document.createElement('div');
    wrap.className = 'control-center-item-slots';
    wrap.style.cssText = 'position:absolute;left:24px;bottom:24px;display:flex;gap:8px;pointer-events:none;';
    wrap.innerHTML = '<span style="color:rgba(255,255,255,0.9);font-size:12px;align-self:center;margin-right:4px;">획득 아이템</span>';
    for (let i = 0; i < 5; i++) {
      const slot = document.createElement('div');
      slot.className = 'item-slot' + (items[i] ? ' filled' : '');
      slot.style.cssText = 'width:40px;height:40px;border:2px solid rgba(255,255,255,0.3);border-radius:8px;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;overflow:hidden;';
      if (items[i] && sources[i]) {
        const img = document.createElement('img');
        img.src = getItemImage(sources[i], 0);
        img.alt = '';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        slot.appendChild(img);
      }
      wrap.appendChild(slot);
    }
    this.domRoot.appendChild(wrap);
    this._itemSlotsWrap = wrap;
  }

  _refreshItemSlots() {
    if (!this._itemSlotsWrap) return;
    const items = this.game.state.get('items') ?? [];
    const sources = this.game.state.get('itemSources') ?? [];
    const slots = this._itemSlotsWrap.querySelectorAll('.item-slot');
    slots.forEach((slot, i) => {
      slot.classList.toggle('filled', !!items[i]);
      slot.innerHTML = '';
      if (items[i] && sources[i]) {
        const img = document.createElement('img');
        img.src = getItemImage(sources[i], 0);
        img.alt = '';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        slot.appendChild(img);
      }
    });
  }

  _addBossVisual() {
    const riskLevel = getRiskLevel(this.game.state);
    const bossSrc = getBossSprite(riskLevel);
    const wrap = document.createElement('div');
    wrap.className = 'control-center-boss';
    wrap.style.cssText = 'position:absolute;right:24px;bottom:24px;width:80px;height:80px;pointer-events:none;';
    const img = document.createElement('img');
    img.src = bossSrc;
    img.alt = '리스크';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    wrap.appendChild(img);
    this.domRoot.appendChild(wrap);
    this._bossImg = img;
  }

  _updateBossVisual() {
    if (this._bossImg) {
      const riskLevel = getRiskLevel(this.game.state);
      this._bossImg.src = getBossSprite(riskLevel);
    }
  }

  async playIntroDialogue() {
    this.game.player.canMove = false;
    for (const charId of INTRO_ORDER) {
      const char = CHARACTERS[charId];
      let x, y;
      if (charId === this.game.state.get('selectedJob')) {
        x = this.game.player.x;
        y = this.game.player.y;
      } else {
        x = this.npcs[charId].x;
        y = this.npcs[charId].y;
      }
      const bubble = new SpeechBubble(this.game.uiContainer);
      bubble.create(x, y - 80, 'bottom');
      await bubble.typeText(char.introLine, char.name);
      await this.waitForInput();
      await bubble.hide();
    }
    const systemMsg = new SystemMessage(this.game.uiContainer);
    systemMsg.show('이제 동료들에게 조언을 구해보세요.');
    await this.wait(1500);
    await systemMsg.hide();
    this.game.player.canMove = true;
  }

  startMainGameLoop() {
    const selectedJob = this.game.state.get('selectedJob');
    const allyOrder = ALLY_ORDER[selectedJob];
    if (allyOrder && allyOrder[0]) this.highlightNextAlly(allyOrder[0]);
  }

  highlightNextAlly(allyId) {
    Object.values(this.npcs).forEach((npc) => npc.hideExclamation());
    if (this.npcs[allyId]) this.npcs[allyId].showExclamation();
  }

  async onNPCInteract(npcId) {
    const selectedJob = this.game.state.get('selectedJob');
    const allyOrder = ALLY_ORDER[selectedJob];
    const expectedAlly = allyOrder[this.currentAllyIndex];
    if (npcId !== expectedAlly) {
      const bubble = new SpeechBubble(this.game.uiContainer);
      const npc = this.npcs[npcId];
      bubble.create(npc.x, npc.y - 80, 'bottom');
      await bubble.typeText('지금은 다른 분께 먼저 조언을 구해보는 게 좋을 것 같아요.');
      await this.waitForInput();
      await bubble.hide();
      return;
    }
    await this.startAllyDialogue(npcId);
  }

  getDialogue(allyId) {
    const key = getDialogueKey(this.game.state.get('selectedJob'), allyId);
    return DIALOGUES[key] || { stage: 1, steps: [], itemReward: 'item' };
  }

  getItemForAlly(allyId) {
    const d = this.getDialogue(allyId);
    return d.itemReward || 'item';
  }

  async startAllyDialogue(allyId) {
    this.game.player.canMove = false;
    const dialogue = this.getDialogue(allyId);
    let stepIdx = 0;
    for (const step of dialogue.steps) {
      if (step.type === 'dialogue') {
        const speakerId = stepIdx % 2 === 0 ? this.game.state.get('selectedJob') : allyId;
        const text = step.text;
        const bubble = new SpeechBubble(this.game.uiContainer);
        const x = speakerId === allyId ? this.npcs[allyId].x : this.game.player.x;
        const y = speakerId === allyId ? this.npcs[allyId].y : this.game.player.y;
        const name = CHARACTERS[speakerId]?.name || '';
        bubble.create(x, y - 80, 'bottom');
        await bubble.typeText(text, name);
        await this.waitForInput();
        await bubble.hide();
        stepIdx++;
      } else if (step.type === 'choice') {
        let choice;
        let confirmed = true;
        do {
          choice = await this.showChoices(step.choices);
          if (!choice.checkpoint) break;
          confirmed = await this.showCheckpoint(choice);
        } while (!confirmed);
        await this.handleChoice(allyId, choice);
      }
    }
    // 아이템 획득: 심화공지판단(S3)·복구판단(S4)에서 가능 (S3에서 2개, S4에서 2개 설계)
    const stage = this._getCurrentStage();
    if (stage === 3 || stage === 4) {
      await this.acquireItem(allyId);
    }
    this._refreshItemSlots();
    this.currentAllyIndex++;
    const allyOrder = ALLY_ORDER[this.game.state.get('selectedJob')];
    if (this.currentAllyIndex < allyOrder.length) {
      await this.showStageTransition();
      this.highlightNextAlly(allyOrder[this.currentAllyIndex]);
    } else {
      await this.startFinalStage();
    }
    this.game.player.canMove = true;
  }

  async showStageTransition() {
    const stageLevel = getStageLevelFromAllyIndex(this.currentAllyIndex);
    const villageImage = BACKGROUNDS.villageByStage[stageLevel] ?? BACKGROUNDS.villageByStage[1];
    if (villageImage) {
      await this.game.showFullscreenImage(villageImage, 2000);
    }
    const guildLevel = Math.min(4, stageLevel);
    const indoorImage = getGuildBg(guildLevel);
    if (indoorImage && this.domRoot) {
      this.domRoot.style.backgroundImage = `url(${indoorImage})`;
      this.domRoot.style.backgroundSize = 'cover';
      this.domRoot.style.backgroundPosition = 'center';
    }
  }

  async showChoices(choices) {
    return new Promise((resolve) => {
      const panel = new ChoicePanel(this.game.uiContainer);
      panel.show(choices, (selectedChoice) => {
        panel.hide();
        resolve(selectedChoice);
      });
    });
  }

  async handleChoice(allyId, choice) {
    if (choice.checkpoint) {
      const confirmed = await this.showCheckpoint(choice);
      if (!confirmed) return;
    }
    this.game.state.applyEffects(choice.effects || {});
    this._updateBossVisual();
    if (choice.response) {
      const bubble = new SpeechBubble(this.game.uiContainer);
      const npc = this.npcs[allyId];
      bubble.create(npc.x, npc.y - 80, 'bottom');
      await bubble.typeText(choice.response, CHARACTERS[allyId].name);
      await this.waitForInput();
      await bubble.hide();
    }
  }

  async showCheckpoint(choice) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'checkpoint-overlay';
      overlay.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:40;pointer-events:auto;';
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
      this.game.uiContainer.appendChild(overlay);
      overlay.querySelector('#checkpoint-edit').onclick = () => {
        overlay.remove();
        resolve(false);
      };
      overlay.querySelector('#checkpoint-confirm').onclick = () => {
        overlay.remove();
        resolve(true);
      };
    });
  }

  /** StageManager와 동일한 경과시간→스테이지 계산 */
  _getCurrentStage() {
    const elapsed = this.game.state.get('elapsedMinutes') ?? 0;
    if (elapsed < 10) return 1;
    if (elapsed < 40) return 2;
    if (elapsed < 130) return 3;
    if (elapsed < 200) return 4;
    return 5;
  }

  async acquireItem(allyId) {
    const itemId = this.getItemForAlly(allyId);
    await this.game.showItemAcquisition(itemId);
    this.game.state.addItem(itemId, allyId);
  }

  async startFinalStage() {
    const systemMsg = new SystemMessage(this.game.uiContainer);
    systemMsg.show('모든 동료의 조언을 모았습니다. 결제 대란을 해소했습니다.');
    await this.wait(2500);
    await systemMsg.hide();
    this.game.state.set({ endingGrade: this._evaluateEnding() });
    this.game.switchScene('ending');
  }

  _evaluateEnding() {
    const chaos = this.game.state.get('internalChaos') ?? 0;
    const ext = this.game.state.get('externalRisk') ?? 0;
    const avg = (chaos + ext) / 2;
    if (avg <= 20) return 'S';
    if (avg <= 40) return 'A';
    if (avg <= 60) return 'B';
    return 'C';
  }

  waitForInput() {
    return new Promise((resolve) => {
      this._resolveWait = resolve;
      const handler = (e) => {
        if (e.code === 'Space' || e.type === 'click') {
          document.removeEventListener('keydown', handler);
          document.removeEventListener('click', handler);
          if (this._resolveWait) {
            this._resolveWait();
            this._resolveWait = null;
          }
        }
      };
      document.addEventListener('keydown', handler);
      document.addEventListener('click', handler);
    });
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async exit() {
    if (this.domRoot?.parentNode) this.domRoot.parentNode.removeChild(this.domRoot);
    this.game.pixi.stage.removeChildren();
  }
}
