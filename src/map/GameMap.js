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

    // 배경색 (이미지 로드 전/실패 시 보임)
    const fill = new PIXI.Graphics();
    fill.beginFill(0x1a1a2e);
    fill.drawRect(0, 0, w, h);
    this.backgroundLayer.addChild(fill);

    const url = this.mapData.background;
    if (!url) return;
    try {
      const bg = PIXI.Sprite.from(url);
      bg.anchor.set(0.5, 0.5);
      bg.x = w / 2;
      bg.y = h / 2;

      // 텍스처 로드 후 비율 유지하며 cover 방식으로 스케일
      const applyCover = () => {
        const tex = bg.texture;
        if (!tex || !tex.valid || tex.width <= 1) return;
        const scaleX = w / tex.width;
        const scaleY = h / tex.height;
        const s = Math.max(scaleX, scaleY);
        bg.scale.set(s);
      };

      const tex = bg.texture;
      if (tex.valid && tex.width > 1) {
        applyCover();
      } else {
        tex.on('update', applyCover);
      }
      this.backgroundLayer.addChild(bg);
    } catch (_) {
      // fill 이미 추가됨
    }
  }
}
