/**
 * PixiJS Application 초기화, DOM 오버레이, 씬 관리
 */
import { Application } from 'pixi.js';
import { StateManager } from './StateManager.js';
import { AssetLoader } from './AssetLoader.js';
import { SceneManager } from './SceneManager.js';
import { InputManager } from './InputManager.js';

export class GameEngine {
  constructor(options = {}) {
    this.width = options.width ?? 1280;
    this.height = options.height ?? 720;
    this.backgroundColor = options.backgroundColor ?? 0x1a1a2e;
    this.app = null;
    this.state = new StateManager();
    this.assetLoader = new AssetLoader();
    this.sceneManager = null;
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

      const overlay = document.getElementById('dom-overlay');
      if (overlay) {
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.left = '0';
        overlay.style.top = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.pointerEvents = 'auto';
        overlay.style.zIndex = '10';
      }
    }

    this.input = new InputManager();
    this.sceneManager = new SceneManager(this);
    await this.sceneManager.init();
    return this;
  }

  run() {
    this.sceneManager.goTo('title');
  }

  get pixi() {
    return this.app;
  }
}
