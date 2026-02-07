/**
 * PixiJS Assets API로 스프라이트/사운드 로딩
 * 맵 배경, NPC 스프라이트, 대화 초상화, 아이템 아이콘 매핑 (없으면 createPlaceholder)
 */
import { Assets, Graphics } from 'pixi.js';

export class AssetLoader {
  constructor() {
    this.bundles = {
      characters: [],
      backgrounds: [],
      items: [],
      ui: [],
      sounds: [],
    };
    this.loaded = false;
  }

  async loadAll(onProgress) {
    const manifest = this._getManifest();
    let done = 0;
    const total = Object.values(manifest).reduce((s, arr) => s + arr.length, 0);

    for (const [bundleId, urls] of Object.entries(manifest)) {
      for (const url of urls) {
        try {
          await Assets.load(url);
        } catch (e) {
          console.warn('Asset load failed:', url, e);
        }
        done++;
        if (onProgress) onProgress(done / total);
      }
    }
    this.loaded = true;
    return this;
  }

  _getManifest() {
    return {
      backgrounds: ['/assets/backgrounds/village-bg.png'].filter(Boolean),
      characters: [],
      items: [],
      ui: [],
      sounds: [],
    };
  }

  getTexture(url) {
    return Assets.get(url) ?? null;
  }

  /** 맵 배경, NPC 스프라이트, 대화 초상화, 아이템 아이콘 없을 때 플레이스홀더 */
  createPlaceholder(type, name) {
    const g = new Graphics();
    g.beginFill(type === 'background' ? 0x1a1a2e : 0x444466);
    g.drawRect(0, 0, type === 'background' ? 800 : 64, type === 'background' ? 600 : 64);
    return g;
  }
}
