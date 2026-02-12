/**
 * GameMap — PixiJS 맵 컨테이너.
 * 레이어: backgroundLayer, objectLayer, npcLayer, playerLayer, effectLayer.
 * mapData는 maps.json의 S1 등.
 */
import * as PIXI from 'pixi.js';
import { Assets } from 'pixi.js';

export class GameMap {
  constructor(mapData) {
    this.mapData = mapData || {};
    this.container = new PIXI.Container();
    this.backgroundLayer = new PIXI.Container();
    this.objectLayer = new PIXI.Container();
    this.npcLayer = new PIXI.Container();
    this.playerLayer = new PIXI.Container();
    this.effectLayer = new PIXI.Container();

    this.container.addChild(this.backgroundLayer);
    this._parallaxFactor = 0.15;
    this.container.addChild(this.objectLayer);
    this.container.addChild(this.npcLayer);
    this.container.addChild(this.playerLayer);
    this.container.addChild(this.effectLayer);

    this._setBackground();
  }

  get width() {
    return this.mapData.width || 1280;
  }

  get height() {
    return this.mapData.height || 720;
  }

  updateParallax(cameraX, cameraY) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    this.backgroundLayer.x = (cameraX - cx) * this._parallaxFactor;
    this.backgroundLayer.y = (cameraY - cy) * this._parallaxFactor;
  }

  _setBackground() {
    const w = this.width;
    const h = this.height;
    const url = this.mapData.background;

    // 초기 어두운 배경 (로딩 중 표시)
    const placeholder = new PIXI.Graphics();
    placeholder.beginFill(0x1a1a2e);
    placeholder.drawRect(0, 0, w, h);
    this.backgroundLayer.addChild(placeholder);

    if (!url) return;

    // 후속조치(S5) 옐로우-그린 그라데이션 (엔딩과 동일 톤: #b8d84d → #7cb342 → #558b2f → #33691e)
    if (url === 'gradient:yellowgreen') {
      const g = new PIXI.Graphics();
      const colors = [0xb8d84d, 0x7cb342, 0x558b2f, 0x33691e];
      const bandH = h / 4;
      for (let i = 0; i < 4; i++) {
        g.beginFill(colors[i]);
        g.drawRect(0, i * bandH, w, bandH + 1);
        g.endFill();
      }
      this.backgroundLayer.addChild(g);
      return;
    }

    const fullUrl = url.startsWith('/') && typeof window !== 'undefined'
      ? window.location.origin + url : url;
    Assets.load(fullUrl)
      .then((tex) => {
        const bg = new PIXI.Sprite(tex);
        bg.anchor.set(0.5, 0.5);
        bg.x = w / 2;
        bg.y = h / 2;
        const texW = tex.width || 1;
        const texH = tex.height || 1;
        const scale = Math.max(w / texW, h / texH);
        bg.scale.set(scale);
        this.backgroundLayer.addChild(bg);
      })
      .catch(() => {});
  }
}
