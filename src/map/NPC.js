/**
 * NPC — npcData 기반, characterId 있으면 characters/{folder}/idle.png 사용.
 */
import * as PIXI from 'pixi.js';
import { CHARACTERS } from '../data/characters.js';

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

    const TARGET_HEIGHT = 64;
    if (this.characterId && CHARACTERS[this.characterId]?.sprites?.idle) {
      const tex = PIXI.Texture.from(CHARACTERS[this.characterId].sprites.idle);
      this.sprite.texture = tex;
      // 비율 유지하며 높이 기준 스케일링
      if (tex.valid && tex.height > 0) {
        const s = TARGET_HEIGHT / tex.height;
        this.sprite.scale.set(s);
      } else {
        this.sprite.scale.set(1);
        const onUpdate = () => {
          if (tex.height > 0) {
            const s = TARGET_HEIGHT / tex.height;
            this.sprite.scale.set(s);
          }
          tex.off('update', onUpdate);
        };
        tex.on('update', onUpdate);
      }
    } else {
      this.sprite.width = 32;
      this.sprite.height = 48;
    }
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
