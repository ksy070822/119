/**
 * 인트로 시네마틱 시퀀스 (v3) — GAME_SCRIPT.md 기반 6개 장면
 * 프롤로그 → 캐릭터 선택 → 컨트롤센터 집결
 */
import { INTRO_SCENES, getPortraitUrl, FADE_BLACK_MS, TYPING_SPEED_MS, HERO_SKILL_LINES, VILLAGER_LINES } from '../ui/IntroSequence.js';
import { CLOUD_OVERLAY, getBossSprite } from '../data/assetPaths.js';
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
        <div class="intro-cloud-overlay" id="intro-cloud-overlay" style="display:none;"></div>
      </div>
      <div class="intro-shake-wrap" id="intro-shake-wrap">
        <div class="intro-boss" id="intro-boss" style="display:none;"></div>
        <div class="intro-portraits" id="intro-portraits"></div>
        <div class="intro-title-only" id="intro-title-only" style="display:none;">
          <h1 class="intro-title-only-heading">다섯 영웅의 소집</h1>
        </div>
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
    const charSelectIndex = INTRO_SCENES.findIndex(s => s.isCharacterSelect);
    if (charSelectIndex < 0) return;

    // 캐릭터가 이미 선택된 경우 (컨트롤센터 집결 씬 등) → 바로 게임 시작
    const selectedJob = this.game.state.get('selectedJob');
    if (selectedJob) {
      this._goToGame();
      return;
    }

    // 이미 캐릭터 선택 화면에 있으면 → 스킵 = 기본 캐릭터로 다음 장면 진행
    if (this.currentScene === charSelectIndex) {
      const defaultCharId = INTRO_ORDER[0] || 'communicator';
      this._onCharacterSelected(defaultCharId);
      return;
    }

    // 인트로 중이면 → 캐릭터 선택 장면으로 바로 이동
    this.currentScene = charSelectIndex;
    this._showScene(charSelectIndex);
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
    const titleOnlyWrap = document.getElementById('intro-title-only');
    if (titleOnlyWrap) titleOnlyWrap.style.display = 'none';
    portraitsEl.style.display = 'none';
    portraitsEl.innerHTML = '';
    villagerLinesEl.innerHTML = '';
    villagerLinesEl.style.display = 'none';
    bossEl.style.display = 'none';
    darkenEl.classList.remove('intro-darken-visible');
    shakeWrap.classList.remove('intro-shake');
    bgWrap.classList.remove('intro-bg-fade-in');
    const cloudEl = document.getElementById('intro-cloud-overlay');
    if (cloudEl) {
      cloudEl.style.display = 'none';
      cloudEl.style.backgroundImage = '';
    }

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
    if (scene.effect === 'darken' || scene.effect === 'shake' || scene.showBoss) {
      const cloudEl = document.getElementById('intro-cloud-overlay');
      if (cloudEl) {
        cloudEl.style.display = 'block';
        cloudEl.style.cssText = `
          display: block; position: absolute; inset: 0; pointer-events: none;
          background-image: url(${CLOUD_OVERLAY}), linear-gradient(180deg, rgba(20,10,10,0.25) 0%, rgba(40,20,20,0.45) 100%);
          background-size: cover, auto; background-position: center;
          opacity: 0.55;
        `;
      }
    }
    if (scene.effect === 'shake') {
      shakeWrap.classList.add('intro-shake');
    }

    // 보스 표시 — weakened 이미지 사용
    if (scene.showBoss) {
      bossEl.style.display = 'block';
      bossEl.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
        width: 240px;
        height: 240px;
      `;
      bossEl.innerHTML = `<img src="${getBossSprite(2)}" alt="결제 대란" style="
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: drop-shadow(0 0 30px #FF0000) drop-shadow(0 0 60px rgba(255,0,0,0.5));
        animation: bossPulse 2s infinite;
      " onerror="this.style.display='none';this.parentElement.style.background='radial-gradient(circle, #8B0000 0%, #000 70%)';this.parentElement.style.borderRadius='50%';this.parentElement.style.boxShadow='0 0 60px #FF0000';">`;
    } else {
      bossEl.innerHTML = '';
    }

    // 다섯 영웅의 소집 — 타이틀만 (마을이 멈춘 날 스타일)
    if (scene.effect === 'titleOnly') {
      textWrap.style.display = 'none';
      const titleOnlyWrap = document.getElementById('intro-title-only');
      if (titleOnlyWrap) {
        titleOnlyWrap.style.display = 'block';
        const heading = titleOnlyWrap.querySelector('.intro-title-only-heading');
        if (heading) heading.textContent = scene.text || '다섯 영웅의 소집';
      }
    } else {
      const titleOnlyWrap = document.getElementById('intro-title-only');
      if (titleOnlyWrap) titleOnlyWrap.style.display = 'none';
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
    container.innerHTML = '';
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      width: 95%;
      max-width: 1200px;
    `;

    const cardsWrap = document.createElement('div');
    cardsWrap.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: 16px;
      flex-wrap: nowrap;
      width: 100%;
      min-width: min(100%, 1080px);
    `;
    container.appendChild(cardsWrap);

    const CARD_DELAY = 2500;
    const HERO_FIRST_DELAY = 3500;  // "다섯 영웅이 나타났습니다" 타이핑 + 1.5초 후 등장

    // 모든 카드를 미리 생성하되 투명하게 숨겨놓음
    const cards = portraitIds.map((charId) => {
      const char = CHARACTERS[charId];
      const skillInfo = HERO_SKILL_LINES[charId] || {};
      const url = getPortraitUrl(charId);

      const card = document.createElement('div');
      card.className = 'intro-hero-card';
      card.style.cssText = `
        flex: 0 0 200px;
        flex-shrink: 0;
        width: 200px;
        min-width: 200px;
        max-width: 200px;
        min-height: 320px;
        box-sizing: border-box;
        padding: 24px 16px;
        background: rgba(30, 30, 50, 0.92);
        border: 3px solid #333;
        border-radius: 14px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        opacity: 0;
        transform: translateY(30px) scale(0.9);
        transition: none;
      `;

      // 초상화
      if (url) {
        const portrait = document.createElement('div');
        // 컨트롤타워는 이미지 위치를 아래로 조정하여 상반신이 보이도록
        const bgSize = charId === 'controlTower' ? '110%' : 'cover';
        const bgPosition = charId === 'controlTower' ? 'center 30%' : 'center';
        portrait.style.cssText = `
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 3px solid ${char?.color || '#FFD700'};
          background-image: url(${url});
          background-size: ${bgSize};
          background-position: ${bgPosition};
          margin-bottom: 14px;
        `;
        card.appendChild(portrait);
      }

      // 이름
      const name = document.createElement('div');
      name.textContent = char?.name || charId;
      name.style.cssText = `
        font-size: 18px;
        font-weight: bold;
        color: ${char?.color || '#fff'};
        margin-bottom: 4px;
        text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
      `;
      card.appendChild(name);

      // 클래스
      if (char?.class) {
        const cls = document.createElement('div');
        cls.textContent = char.class;
        cls.style.cssText = `
          font-size: 13px;
          color: #aaa;
          margin-bottom: 10px;
        `;
        card.appendChild(cls);
      }

      // 스킬 대사
      if (showSkillLines && skillInfo.introLine) {
        const line = document.createElement('div');
        line.textContent = `"${skillInfo.introLine}"`;
        line.style.cssText = `
          color: #FFD700;
          font-size: 12px;
          font-style: italic;
          line-height: 1.5;
          word-break: keep-all;
          overflow-wrap: break-word;
          max-width: 160px;
        `;
        card.appendChild(line);
      }

      cardsWrap.appendChild(card);
      return { card, char };
    });

    // "다섯 영웅이 나타났습니다" 후 커뮤니케이터부터 순차 등장
    cards.forEach(({ card, char }, i) => {
      const id = setTimeout(() => {
        // 등장 애니메이션
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out, border-color 0.4s, box-shadow 0.4s';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
        card.style.borderColor = char?.color || '#FFD700';
        card.style.boxShadow = `0 0 20px ${char?.color || '#FFD700'}44`;

        // 글로우 강조 후 약하게 전환 (다음 캐릭터 등장 전)
        const dimId = setTimeout(() => {
          card.style.boxShadow = `0 0 8px ${char?.color || '#FFD700'}22`;
        }, CARD_DELAY - 600);
        this._timeoutIds.push(dimId);
      }, HERO_FIRST_DELAY + i * CARD_DELAY);
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
          white-space: pre-line;
          word-break: keep-all;
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
