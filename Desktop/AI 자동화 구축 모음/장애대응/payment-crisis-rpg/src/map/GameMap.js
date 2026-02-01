/**
 * GameMap — PixiJS 맵 컨테이너.
 * 레이어: backgroundLayer, objectLayer, npcLayer, playerLayer, effectLayer.
 * mapData는 maps.json의 S1 등.
 */
import * as PIXI from 'pixi.js';

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
    this.container.addChild(this.objectLayer);
    this.container.addChild(this.npcLayer);
    this.container.addChild(this.playerLayer);
    this.container.addChild(this.effectLayer);

    this._setBackground();
  }

  get width() {
    return this.mapData.width || 800;
  }

  get height() {
    return this.mapData.height || 600;
  }

  _setBackground() {
    const w = this.width;
    const h = this.height;
    const url = this.mapData.background;
    if (url) {
      try {
        const bg = PIXI.Sprite.from(url);
        bg.anchor.set(0, 0);
        bg.width = w;
        bg.height = h;
        this.backgroundLayer.addChild(bg);
      } catch (_) {
        const g = new PIXI.Graphics();
        g.beginFill(0x1a1a2e);
        g.drawRect(0, 0, w, h);
        this.backgroundLayer.addChild(g);
      }
    } else {
      const g = new PIXI.Graphics();
      g.beginFill(0x1a1a2e);
      g.drawRect(0, 0, w, h);
      this.backgroundLayer.addChild(g);
    }
  }
}
