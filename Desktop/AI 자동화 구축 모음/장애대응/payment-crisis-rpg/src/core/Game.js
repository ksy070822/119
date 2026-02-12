/**
 * 메인 게임 클래스 (v3) — 씬 전환, 배경/전광판/효과, 플레이어·NPC 생성
 */
import { Application } from 'pixi.js';
import { StateManager } from './StateManager.js';
import { AssetLoader } from './AssetLoader.js';
import { InputManager } from './InputManager.js';
import { SceneManager } from './SceneManager.js';
import { BGMManager } from '../audio/BGMManager.js';
import { Player } from '../entities/Player.js';
import { NPC } from '../entities/NPC.js';

export class Game {
  constructor(options = {}) {
    this.width = options.width ?? 1280;
    this.height = options.height ?? 720;
    this.backgroundColor = options.backgroundColor ?? 0x1a1a2e;
    this.app = null;
    this.state = new StateManager();
    this.assetLoader = new AssetLoader();
    this.sceneManager = null;
    this.input = null;
    this.player = null;
    this._overlayEl = null;
    this._uiContainer = null;
    this._overlay = null;
    this._effects = { play: () => {} };
  }

  async init() {
    this.app = new Application({
      width: this.width,
      height: this.height,
      backgroundColor: this.backgroundColor,
      resolution: window.devicePixelRatio ?? 1,
      autoDensity: true,
      antialias: true,
    });

    const wrap = document.getElementById('game-canvas-wrap');
    if (wrap) {
      wrap.style.width = this.width + 'px';
      wrap.style.height = this.height + 'px';
      wrap.style.position = 'relative';
      const existingCanvas = wrap.querySelector('#game-canvas');
      if (existingCanvas) existingCanvas.style.display = 'none';
      const view = this.app.view;
      if (view) {
        wrap.appendChild(view);
        view.style.display = 'block';
        view.style.width = '100%';
        view.style.height = '100%';
      }
      this._overlayEl = document.getElementById('dom-overlay');
      if (this._overlayEl) {
        this._overlayEl.style.position = 'absolute';
        this._overlayEl.style.inset = '0';
        this._overlayEl.style.zIndex = '10';
      }
    }

    this.input = new InputManager();
    this.player = new Player();
    this.bgm = new BGMManager();
    this.sceneManager = new SceneManager(this);
    await this.sceneManager.init();
    if (typeof document !== 'undefined') {
      const unlock = () => this.bgm?.unlock();
      document.addEventListener('click', unlock, { once: true, capture: true });
      document.addEventListener('touchstart', unlock, { once: true, capture: true });
      document.addEventListener('keydown', unlock, { once: true, capture: true });
    }
    return this;
  }

  createNPC(id, x, y) {
    return new NPC(id, x, y);
  }

  run() {
    this.sceneManager.goTo('title');
  }

  get overlay() {
    if (!this._overlay) {
      this._overlay = document.createElement('div');
      this._overlay.className = 'game-overlay';
      this._overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:5;';
      if (this._overlayEl) this._overlayEl.appendChild(this._overlay);
    }
    return this._overlay;
  }

  get uiContainer() {
    if (!this._uiContainer) {
      this._uiContainer = this._overlayEl || document.body;
    }
    return this._uiContainer;
  }

  get effects() {
    return this._effects;
  }

  switchScene(name) {
    return this.sceneManager.goTo(name);
  }

  async showBackground(imagePathOrKey) {
    const stage = this.app.stage;
    stage.removeChildren();
    const { Graphics } = await import('pixi.js');
    const g = new Graphics();
    g.beginFill(0x1a1a2e);
    g.drawRect(0, 0, this.width, this.height);
    stage.addChild(g);
    const raw = imagePathOrKey.startsWith('/') ? imagePathOrKey : `/assets/maps/${imagePathOrKey}`;
    const fullUrl = typeof window !== 'undefined' && window.location && raw.startsWith('/')
      ? window.location.origin + raw
      : raw;
    const url = fullUrl.includes('?') ? fullUrl : encodeURI(fullUrl);
    try {
      const { Assets, Sprite } = await import('pixi.js');
      const texture = await Assets.load(url);
      if (texture) {
        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.x = this.width / 2;
        sprite.y = this.height / 2;
        const scale = Math.max(this.width / (sprite.width || 1), this.height / (sprite.height || 1));
        sprite.scale.set(scale);
        stage.addChildAt(sprite, 0);
      }
    } catch (_) {}
  }

  showBillboard(status, text) {
    return new Promise((resolve) => {
      const el = document.createElement('div');
      el.className = 'billboard';
      el.innerHTML = `<span class="billboard-status">${status}</span><span class="billboard-text">${text}</span>`;
      el.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;color:#fff;z-index:20;pointer-events:none;';
      el.style.color = status === 'GREEN' ? '#2ecc71' : status === 'YELLOW' ? '#f1c40f' : '#e74c3c';
      this.uiContainer.appendChild(el);
      setTimeout(() => {
        el.remove();
        resolve();
      }, 2500);
    });
  }

  async flickerBillboard(colors) {
    for (const status of colors) {
      await this.showBillboard(status, status === 'GREEN' ? 'ALL SYSTEMS NORMAL' : status === 'YELLOW' ? 'CAUTION' : 'ALERT');
      await this.wait(300);
    }
  }

  async showFullscreenImage(imagePath, duration = 2000) {
    const { StageTransition } = await import('../ui/StageTransition.js');
    const transition = new StageTransition(this.uiContainer);
    return transition.show(imagePath, duration);
  }

  showItemAcquisition(itemId) {
    return new Promise((resolve) => {
      const el = document.createElement('div');
      el.className = 'item-acquisition';
      el.innerHTML = `<span class="item-acquisition-text">아이템을 획득했습니다!</span>`;
      el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.85);color:#fff;padding:24px 48px;border-radius:12px;font-size:18px;z-index:50;';
      this.uiContainer.appendChild(el);
      setTimeout(() => {
        el.remove();
        resolve();
      }, 1500);
    });
  }

  wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  get pixi() {
    return this.app;
  }
}
