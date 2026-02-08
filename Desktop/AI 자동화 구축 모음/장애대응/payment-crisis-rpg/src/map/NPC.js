/**
 * NPC — npcData 기반, characterId 있으면 characters/{folder}/idle.png 사용.
 * 비율 유지 스케일(SPRITE_HEIGHT=96), 로드 실패 시 64x96 기본.
 */
import * as PIXI from 'pixi.js';
import { Assets } from 'pixi.js';
import { CHARACTERS } from '../data/characters.js';

const SPRITE_HEIGHT = 96;

export class NPC {
  constructor(npcData) {
    this.id = npcData?.id ?? 'npc';
    this.name = npcData?.name ?? 'NPC';
    this.characterId = npcData?.characterId ?? null;
    this.x = npcData?.position?.x ?? 0;
    this.y = npcData?.position?.y ?? 0;
    this.dialogueId = npcData?.dialogueId ?? null;
    this.itemReward = npcData?.itemReward ?? null;
    this.isGuardian = npcData?.isGuardian ?? false;
    this.guardianCondition = npcData?.guardianCondition ?? null;
    this.interactionRadius = npcData?.interactionRadius ?? 60;
    this.hasSpoken = false;

    this.sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.sprite.anchor.set(0.5, 1);
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    if (this.characterId && CHARACTERS[this.characterId]?.sprites?.idle) {
      const url = CHARACTERS[this.characterId].sprites.idle;
      const fullUrl = url.startsWith('/') && typeof window !== 'undefined' ? window.location.origin + url : url;
      Assets.load(fullUrl)
        .then((tex) => {
          this.sprite.texture = tex;
          this._applyTextureScale(tex);
        })
        .catch(() => {
          this.sprite.width = 64;
          this.sprite.height = SPRITE_HEIGHT;
        });
      this.sprite.width = 64;
      this.sprite.height = SPRITE_HEIGHT;
    } else {
      this.sprite.width = 64;
      this.sprite.height = SPRITE_HEIGHT;
    }
  }

  _applyTextureScale(tex) {
    if (!tex || !this.sprite) return;
    const tw = tex?.width ?? 64;
    const th = tex?.height ?? 96;
    if (tw <= 1 || th <= 1) {
      this.sprite.width = 64;
      this.sprite.height = SPRITE_HEIGHT;
      return;
    }
    const ratio = th / SPRITE_HEIGHT;
    this.sprite.width = Math.round(tw / ratio);
    this.sprite.height = SPRITE_HEIGHT;
  }

  isPlayerInRange(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.interactionRadius;
  }

  showInteractionHint(show) {
    // TODO: exclamationMark 표시/숨김
  }

  onDialogueComplete() {
    this.hasSpoken = true;
  }
}
