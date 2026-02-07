/**
 * 인트로 시네마틱 시퀀스 (v3) — GAME_SCRIPT.md 기반 6개 장면
 * 프롤로그 → 캐릭터 선택 → 컨트롤센터 집결
 */
import { INTRO_SCENES, getPortraitUrl, FADE_BLACK_MS, TYPING_SPEED_MS, HERO_SKILL_LINES, VILLAGER_LINES } from '../ui/IntroSequence.js';
import { CharacterSelect } from '../ui/CharacterSelect.js';
import { CHARACTERS, INTRO_ORDER } from '../data/characters.js';

export class IntroScene {
  constructor(game) {
    this.game = game;
    this.currentScene = 0;
    this.domRoot = null;
    this._timeoutIds = [];
    this._typingId = null;
    this._keyHandler = null;
    this._characterSelect = null;
    this._villagerLineIndex = 0;
    this._isTransitioning = false;  // 전환 중 플래그
  }

  async enter() {
    this.currentScene = 0;
    this._villagerLineIndex = 0;
    this._buildDOM();
    this._bindKeys();
    this._showScene(0);
  }

  _buildDOM() {
    const overlay = this.game.uiContainer;
    if (!overlay) return;
    overlay.innerHTML = '';
    this.domRoot = document.createElement('div');
    this.domRoot.className = 'intro-sequence';
    this.domRoot.style.cssText = 'position:absolute;inset:0;z-index:20;overflow:hidden;pointer-events:auto;';
    this.domRoot.innerHTML = `
      <div class="intro-fade-black" id="intro-fade-black"></div>
      <div class="intro-bg-wrap" id="intro-bg-wrap">
        <div class="intro-bg" id="intro-bg"></div>
        <div class="intro-darken" id="intro-darken"></div>
      </div>
      <div class="intro-shake-wrap" id="intro-shake-wrap">
        <div class="intro-boss" id="intro-boss" style="display:none;"></div>
        <div class="intro-portraits" id="intro-portraits"></div>
        <div class="intro-villager-lines" id="intro-villager-lines"></div>
        <div class="intro-text-wrap" id="intro-text-wrap">
          <p class="intro-text" id="intro-text"></p>
        </div>
      </div>
      <div class="intro-title-card" id="intro-title-card" style="display:none;">
        <h1 class="intro-title-heading" id="intro-title-heading"></h1>
        <button type="button" class="intro-btn-start" id="intro-btn-start">게임 시작</button>
      </div>
      <div class="intro-character-select" id="intro-character-select" style="display:none;"></div>
      <button type="button" class="intro-skip-btn" id="intro-skip-btn">스킵 >></button>
    `;
    overlay.appendChild(this.domRoot);

    const skipBtn = document.getElementById('intro-skip-btn');
    if (skipBtn) skipBtn.addEventListener('click', () => this._skipToCharacterSelect());

    const startBtn = document.getElementById('intro-btn-start');
    if (startBtn) startBtn.addEventListener('click', () => this._goToGame());
  }

  _bindKeys() {
    const self = this;
    this._keyHandler = (e) => {
      if (e.key === ' ' || e.key === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        self._onAdvance();
      }
    };
    this.domRoot?.addEventListener('click', (e) => {
      if (e.target.closest('#intro-skip-btn') || e.target.closest('#intro-btn-start')) return;
      if (e.target.closest('.character-select-wrap')) return;
      this._onAdvance();
    });
    window.addEventListener('keydown', this._keyHandler);
  }

  _unbindKeys() {
    window.removeEventListener('keydown', this._keyHandler);
  }

  _clearTimeouts() {
    this._timeoutIds.forEach(clearTimeout);
    this._timeoutIds = [];
    if (this._typingId) clearTimeout(this._typingId);
    this._typingId = null;
  }

  _onAdvance() {
    // 이미 전환 중이면 무시
    if (this._isTransitioning) return;

    const scene = INTRO_SCENES[this.currentScene];
    if (!scene) return;

    // 캐릭터 선택 화면에서는 클릭으로 진행 안 함
    if (scene.isCharacterSelect) return;

    if (this.currentScene >= INTRO_SCENES.length - 1) return;

    this._isTransitioning = true;
    this._clearTimeouts();
    this._startFadeBlack().then(() => {
      this.currentScene++;
      this._isTransitioning = false;
      this._showScene(this.currentScene);
    });
  }

  _skipToCharacterSelect() {
    this._clearTimeouts();
    // 캐릭터 선택 장면으로 바로 이동
    const charSelectIndex = INTRO_SCENES.findIndex(s => s.isCharacterSelect);
    if (charSelectIndex >= 0) {
      this.currentScene = charSelectIndex;
      this._showScene(charSelectIndex);
    }
  }

  _goToGame() {
    this._clearTimeouts();
    this._unbindKeys();
    if (this.domRoot?.parentNode) this.domRoot.parentNode.removeChild(this.domRoot);
    this.game.state.set({ introCompleted: true });
    this.game.switchScene('game');
  }

  _startFadeBlack() {
    return new Promise((resolve) => {
      const el = document.getElementById('intro-fade-black');
      if (!el) return resolve();
      el.classList.add('intro-fade-black-visible');
      const id = setTimeout(() => {
        resolve();
      }, FADE_BLACK_MS);
      this._timeoutIds.push(id);
    });
  }

  _hideFadeBlack() {
    document.getElementById('intro-fade-black')?.classList.remove('intro-fade-black-visible');
  }

  _showScene(index) {
    this._hideFadeBlack();
    const scene = INTRO_SCENES[index];
    if (!scene) return;

    const bgEl = document.getElementById('intro-bg');
    const bgWrap = document.getElementById('intro-bg-wrap');
    const darkenEl = document.getElementById('intro-darken');
    const shakeWrap = document.getElementById('intro-shake-wrap');
    const textWrap = document.getElementById('intro-text-wrap');
    const textEl = document.getElementById('intro-text');
    const portraitsEl = document.getElementById('intro-portraits');
    const titleCard = document.getElementById('intro-title-card');
    const titleHeading = document.getElementById('intro-title-heading');
    const bossEl = document.getElementById('intro-boss');
    const villagerLinesEl = document.getElementById('intro-villager-lines');
    const charSelectEl = document.getElementById('intro-character-select');

    if (!bgEl || !textEl) return;

    // 초기화
    titleCard.style.display = 'none';
    charSelectEl.style.display = 'none';
    textWrap.style.display = 'block';
    portraitsEl.style.display = 'none';
    portraitsEl.innerHTML = '';
    villagerLinesEl.innerHTML = '';
    villagerLinesEl.style.display = 'none';
    bossEl.style.display = 'none';
    darkenEl.classList.remove('intro-darken-visible');
    shakeWrap.classList.remove('intro-shake');
    bgWrap.classList.remove('intro-bg-fade-in');

    // 캐릭터 선택 화면
    if (scene.isCharacterSelect) {
      bgEl.style.backgroundImage = scene.background ? `url(${scene.background})` : 'none';
      bgEl.style.backgroundSize = 'cover';
      bgEl.style.backgroundPosition = 'center';
      textWrap.style.display = 'none';
      charSelectEl.style.display = 'block';
      this._showCharacterSelect(charSelectEl);
      return;
    }

    // 타이틀 화면
    if (scene.isTitle) {
      bgEl.style.backgroundImage = scene.background ? `url(${scene.background})` : 'none';
      bgEl.style.backgroundSize = 'cover';
      bgEl.style.backgroundPosition = 'center';
      bgEl.style.backgroundColor = scene.background ? 'transparent' : '#000';
      textWrap.style.display = 'none';
      titleCard.style.display = 'flex';
      titleHeading.textContent = scene.text;
      return;
    }

    // 컨트롤센터 집결 (캐릭터 선택 후)
    if (scene.isControlCenter) {
      bgEl.style.backgroundImage = scene.background ? `url(${scene.background})` : 'none';
      bgEl.style.backgroundSize = 'cover';
      bgEl.style.backgroundPosition = 'center';
      textEl.textContent = '';
      this._typeText(textEl, scene.text);

      // 자동으로 게임 시작
      const id = setTimeout(() => {
        this._goToGame();
      }, scene.duration || 3000);
      this._timeoutIds.push(id);
      return;
    }

    // 일반 장면
    bgEl.style.backgroundImage = scene.background ? `url(${scene.background})` : 'none';
    bgEl.style.backgroundSize = 'cover';
    bgEl.style.backgroundPosition = 'center';
    bgEl.style.backgroundColor = scene.background ? 'transparent' : '#0a0a0f';

    // 효과 적용
    if (scene.effect === 'fadeIn') {
      bgWrap.classList.add('intro-bg-fade-in');
    }
    if (scene.effect === 'darken') {
      darkenEl.classList.add('intro-darken-visible');
    }
    if (scene.effect === 'shake') {
      shakeWrap.classList.add('intro-shake');
    }

    // 보스 표시
    if (scene.showBoss) {
      bossEl.style.display = 'block';
      bossEl.style.cssText = `
        display: block;
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, #8B0000 0%, #000 70%);
        border-radius: 50%;
        box-shadow: 0 0 60px #FF0000;
        animation: bossPulse 2s infinite;
      `;
    }

    // 영웅 초상화 + 스킬 대사
    if (scene.effect === 'portraits' && scene.portraitIds?.length) {
      portraitsEl.style.display = 'flex';
      this._showPortraitsWithSkillLines(portraitsEl, scene.portraitIds, scene.showSkillLines);
    }

    // 마을 주민 대사
    if (scene.villagerLines?.length) {
      villagerLinesEl.style.display = 'block';
      villagerLinesEl.style.cssText = `
        display: block;
        position: absolute;
        bottom: 180px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
      `;
      this._showVillagerLines(villagerLinesEl, scene.villagerLines);
    }

    // 나레이션 텍스트
    textEl.textContent = '';
    this._typeText(textEl, scene.text);

    // 자동 진행
    if (scene.duration > 0) {
      const id = setTimeout(() => {
        // 현재 씬 인덱스가 변하지 않았고, 전환 중이 아닐 때만 진행
        if (index === this.currentScene && index < INTRO_SCENES.length - 1 && !this._isTransitioning) {
          this._isTransitioning = true;
          this._startFadeBlack().then(() => {
            this.currentScene++;
            this._isTransitioning = false;
            this._showScene(this.currentScene);
          });
        }
      }, scene.duration);
      this._timeoutIds.push(id);
    }
  }

  _showPortraitsWithSkillLines(container, portraitIds, showSkillLines) {
    container.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: 20px;
      position: absolute;
      bottom: 160px;
      left: 50%;
      transform: translateX(-50%);
      padding: 24px 32px;
    `;

    // 먼저 빈 원형 슬롯 5개를 배치
    const slots = [];
    portraitIds.forEach((charId, i) => {
      const char = CHARACTERS[charId];
      const slot = document.createElement('div');
      slot.className = 'intro-portrait-slot';
      slot.style.cssText = `
        width: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      `;

      // 빈 원형 테두리
      const circle = document.createElement('div');
      circle.className = 'intro-portrait-circle';
      circle.style.cssText = `
        width: 100px;
        height: 100px;
        border-radius: 50%;
        border: 3px solid rgba(212, 175, 55, 0.3);
        background: rgba(0, 0, 0, 0.3);
        box-shadow: 0 0 10px rgba(212, 175, 55, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.6s ease;
      `;
      slot.appendChild(circle);

      // 이름 자리 (빈 상태)
      const nameEl = document.createElement('div');
      nameEl.style.cssText = `
        color: transparent;
        font-size: 14px;
        font-weight: bold;
        text-align: center;
        text-shadow: 1px 1px 2px #000;
        min-height: 20px;
        transition: color 0.4s ease;
      `;
      slot.appendChild(nameEl);

      // 클래스/소개 자리
      const infoEl = document.createElement('div');
      infoEl.style.cssText = `
        color: transparent;
        font-size: 11px;
        text-align: center;
        line-height: 1.4;
        min-height: 32px;
        transition: color 0.4s ease;
      `;
      slot.appendChild(infoEl);

      container.appendChild(slot);
      slots.push({ slot, circle, nameEl, infoEl, charId, char });
    });

    // 한 명씩 채워나가기 (2초 간격)
    const delay = 2000;
    slots.forEach(({ circle, nameEl, infoEl, charId, char }, i) => {
      const id = setTimeout(() => {
        const skillInfo = HERO_SKILL_LINES[charId] || {};
        const url = getPortraitUrl(charId);
        const color = char?.color || '#FFD700';

        // 원형에 초상화 채우기
        circle.style.border = `3px solid ${color}`;
        circle.style.boxShadow = `0 0 20px ${color}, 0 0 40px ${color}40`;
        circle.style.background = 'rgba(0, 0, 0, 0.5)';
        if (url) {
          circle.style.backgroundImage = `url(${url})`;
          circle.style.backgroundSize = 'cover';
          circle.style.backgroundPosition = 'center';
        }
        circle.style.animation = 'intro-portrait-fade-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';

        // 이름 표시
        nameEl.textContent = char?.name || charId;
        nameEl.style.color = color;

        // 클래스 + 설명
        const descParts = [];
        if (char?.class) descParts.push(char.class);
        if (char?.description) descParts.push(char.description.replace(/\n/g, '<br>'));
        infoEl.innerHTML = descParts.join('<br>');
        infoEl.style.color = '#ccc';

        // 스킬 대사 (하단 텍스트에 표시)
        if (showSkillLines && skillInfo.skillLine) {
          const textEl = document.getElementById('intro-text');
          if (textEl) {
            textEl.textContent = '';
            this._typeText(textEl, `"${skillInfo.skillLine}"`);
          }
        }
      }, i * delay);
      this._timeoutIds.push(id);
    });
  }

  _showVillagerLines(container, lines) {
    const delay = 1500;
    lines.forEach((line, i) => {
      const id = setTimeout(() => {
        const lineEl = document.createElement('div');
        lineEl.className = 'villager-line';
        lineEl.style.cssText = `
          color: #fff;
          font-size: 14px;
          margin: 8px 0;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 8px;
          animation: fadeInUp 0.3s ease-out;
        `;
        lineEl.innerHTML = `<strong style="color:#FFD700">${line.speaker}:</strong> "${line.text}"`;
        container.appendChild(lineEl);
      }, i * delay);
      this._timeoutIds.push(id);
    });
  }

  _showCharacterSelect(container) {
    container.innerHTML = '';
    this._characterSelect = new CharacterSelect(container, (selectedId) => {
      this._onCharacterSelected(selectedId);
    });
    this._characterSelect.render();
  }

  _onCharacterSelected(charId) {
    // 기존 타임아웃 모두 정리 (충돌 방지)
    this._clearTimeouts();

    // 선택한 캐릭터 저장
    this.game.state.set({ selectedJob: charId });

    // 캐릭터 선택 UI 제거
    if (this._characterSelect) {
      this._characterSelect.destroy();
      this._characterSelect = null;
    }

    // 다음 장면으로 (컨트롤센터 집결)
    this._startFadeBlack().then(() => {
      this.currentScene++;
      this._showScene(this.currentScene);
    });
  }

  _typeText(el, fullText) {
    if (!el || fullText == null) return;
    let i = 0;
    const type = () => {
      if (i < fullText.length) {
        el.textContent = fullText.slice(0, i + 1);
        i++;
        this._typingId = setTimeout(type, TYPING_SPEED_MS);
      }
    };
    type();
  }

  async exit() {
    this._clearTimeouts();
    this._unbindKeys();
    if (this._characterSelect) {
      this._characterSelect.destroy();
      this._characterSelect = null;
    }
    if (this.domRoot?.parentNode) this.domRoot.parentNode.removeChild(this.domRoot);
  }
}
