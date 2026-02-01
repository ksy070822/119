/**
 * 인트로 시네마틱 시퀀스 (v3) — 여러 장면 순차 전환, 타이핑, 페이드, 스킵
 */
import { INTRO_SCENES, getPortraitUrl, FADE_BLACK_MS, TYPING_SPEED_MS } from '../ui/IntroSequence.js';

export class IntroScene {
  constructor(game) {
    this.game = game;
    this.currentScene = 0;
    this.domRoot = null;
    this._timeoutIds = [];
    this._typingId = null;
    this._keyHandler = null;
  }

  async enter() {
    this.currentScene = 0;
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
        <div class="intro-portraits" id="intro-portraits"></div>
        <div class="intro-text-wrap" id="intro-text-wrap">
          <p class="intro-text" id="intro-text"></p>
        </div>
      </div>
      <div class="intro-title-card" id="intro-title-card" style="display:none;">
        <h1 class="intro-title-heading" id="intro-title-heading"></h1>
        <button type="button" class="intro-btn-start" id="intro-btn-start">게임 시작</button>
      </div>
      <button type="button" class="intro-skip-btn" id="intro-skip-btn">스킵 &gt;&gt;</button>
    `;
    overlay.appendChild(this.domRoot);

    const skipBtn = document.getElementById('intro-skip-btn');
    if (skipBtn) skipBtn.addEventListener('click', () => this._skipToTitle());

    const startBtn = document.getElementById('intro-btn-start');
    if (startBtn) startBtn.addEventListener('click', () => this._goToVillage());
  }

  _bindKeys() {
    const self = this;
    this._keyHandler = (e) => {
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        self._onAdvance();
      }
    };
    this.domRoot?.addEventListener('click', (e) => {
      if (e.target.closest('#intro-skip-btn') || e.target.closest('#intro-btn-start')) return;
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
    if (this.currentScene >= INTRO_SCENES.length - 1) return;
    this._clearTimeouts();
    this._startFadeBlack().then(() => {
      this.currentScene++;
      this._showScene(this.currentScene);
    });
  }

  _skipToTitle() {
    this._clearTimeouts();
    this._unbindKeys();
    if (this.domRoot?.parentNode) this.domRoot.parentNode.removeChild(this.domRoot);
    this.game.switchScene('title');
  }

  _goToVillage() {
    this._clearTimeouts();
    this._unbindKeys();
    if (this.domRoot?.parentNode) this.domRoot.parentNode.removeChild(this.domRoot);
    this.game.state.set({ introCompleted: true });
    this.game.switchScene('title');
  }

  _startFadeBlack() {
    return new Promise((resolve) => {
      const el = document.getElementById('intro-fade-black');
      if (!el) return resolve();
      el.classList.add('intro-fade-black-visible');
      const id = setTimeout(resolve, FADE_BLACK_MS);
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

    if (!bgEl || !textEl) return;

    titleCard.style.display = 'none';
    textWrap.style.display = 'block';
    portraitsEl.style.display = scene.effect === 'portraits' ? 'flex' : 'none';
    portraitsEl.innerHTML = '';
    darkenEl.classList.remove('intro-darken-visible');
    shakeWrap.classList.remove('intro-shake');
    bgWrap.classList.remove('intro-bg-fade-in');

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

    bgEl.style.backgroundImage = scene.background ? `url(${scene.background})` : 'none';
    bgEl.style.backgroundSize = 'cover';
    bgEl.style.backgroundPosition = 'center';
    bgEl.style.backgroundColor = scene.background ? 'transparent' : '#0a0a0f';

    if (scene.effect === 'fadeIn') {
      bgWrap.classList.add('intro-bg-fade-in');
    }
    if (scene.effect === 'darken') {
      darkenEl.classList.add('intro-darken-visible');
    }
    if (scene.effect === 'shake') {
      shakeWrap.classList.add('intro-shake');
    }

    if (scene.effect === 'portraits' && scene.portraitIds?.length) {
      this._showPortraitsOneByOne(portraitsEl, scene.portraitIds);
    }

    textEl.textContent = '';
    this._typeText(textEl, scene.text);

    if (scene.duration > 0) {
      const id = setTimeout(() => {
        if (index === this.currentScene && index < INTRO_SCENES.length - 1) {
          this._startFadeBlack().then(() => {
            this.currentScene++;
            this._showScene(this.currentScene);
          });
        }
      }, scene.duration);
      this._timeoutIds.push(id);
    }
  }

  _showPortraitsOneByOne(container, portraitIds) {
    const delay = 500;
    portraitIds.forEach((charId, i) => {
      const id = setTimeout(() => {
        const url = getPortraitUrl(charId);
        if (!url) return;
        const img = document.createElement('div');
        img.className = 'intro-portrait-item intro-portrait-fade-in';
        img.style.backgroundImage = `url(${url})`;
        container.appendChild(img);
      }, i * delay);
      this._timeoutIds.push(id);
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
    if (this.domRoot?.parentNode) this.domRoot.parentNode.removeChild(this.domRoot);
  }
}
