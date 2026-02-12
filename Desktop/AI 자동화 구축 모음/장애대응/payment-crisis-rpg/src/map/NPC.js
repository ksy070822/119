/**
 * NPC — npcData 기반, characterId 있으면 characters/{folder}/idle.png 사용.
 * 비율 유지 스케일(SPRITE_HEIGHT=96), 로드 실패 시 64x96 기본.
 * exclamationMark: 대화 가능 시 머리 위 `!` 마크 바운스 애니메이션.
 */
import * as PIXI from 'pixi.js';
import { Assets, ALPHA_MODES } from 'pixi.js';
import { CHARACTERS } from '../data/characters.js';
import { getGuardianIdle } from '../data/assetPaths.js';

const SPRITE_HEIGHT = 170;
/** 관장자(CCO, PR, 대외협력, CTO, 법무)는 일반 영웅보다 약간 크게 (배율). PR은 더 눈에 띄게 */
const GUARDIAN_SIZE_SCALE = 1.15;
const GUARDIAN_SIZE_SCALE_PR = 1.28;

/** 관장자 전용 색상 */
const GUARDIAN_COLORS = {
  '#E67E22': 0xE67E22,  // CCO
  '#3498DB': 0x3498DB,  // 대외협력
  '#9B59B6': 0x9B59B6,  // PR
  '#E74C3C': 0xE74C3C,  // CTO
  '#5B2C6F': 0x5B2C6F,  // 법무 (후속조치)
};

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
    this.guardianColor = npcData?.guardianColor ?? null;
    this.interactionRadius = npcData?.interactionRadius ?? 60;
    this.hasSpoken = false;
    this._exclamationMark = null;

    // 캐릭터 스프라이트: 관장자는 화면에서 전신(idle)만 사용. 대화창 상반신은 GameScene에서 portrait 사용.
    const heroUrl = this.characterId && CHARACTERS[this.characterId]?.sprites?.idle
      ? CHARACTERS[this.characterId].sprites.idle : null;
    const guardianUrl = this.isGuardian ? getGuardianIdle(this.name) : null; // 맵용 전신샷만
    const spriteUrl = heroUrl || guardianUrl;

    console.log(`[NPC ${this.name}] characterId: ${this.characterId}, spriteUrl: ${spriteUrl}`);

    if (spriteUrl) {
      this.sprite = new PIXI.Container();
      const spr = new PIXI.Sprite(PIXI.Texture.EMPTY);
      spr.anchor.set(0.5, 1);
      spr.width = 64;
      const guardianScale = this.isGuardian ? (this.name === 'PR' ? GUARDIAN_SIZE_SCALE_PR : GUARDIAN_SIZE_SCALE) : 1;
      spr.height = this.isGuardian ? (SPRITE_HEIGHT + 16) * guardianScale : SPRITE_HEIGHT;
      this._spriteImage = spr;
      this.sprite.addChild(spr);
      const fullUrl = spriteUrl.startsWith('/') && typeof window !== 'undefined' ? window.location.origin + spriteUrl : spriteUrl;
      Assets.load(fullUrl)
        .then((tex) => {
          if (tex?.baseTexture) {
            // NO_PREMULTIPLIED_ALPHA: 투명 PNG의 배경을 올바르게 처리 (모든 캐릭터 동일)
            tex.baseTexture.alphaMode = ALPHA_MODES.NO_PREMULTIPLIED_ALPHA;
          }
          spr.texture = tex;
          this._applyTextureScale(tex, this.isGuardian);
          if (this.isGuardian) {
            this._addGuardianGlow();
            this._addGuardianNameLabel();
          }
        })
        .catch(() => {
          if (this._spriteImage && this.sprite.removeChild) {
            this.sprite.removeChild(this._spriteImage);
          }
          this._spriteImage = null;
          this._drawFallbackSprite();
        });
    } else {
      this.sprite = new PIXI.Container();
      this._drawFallbackSprite();
    }
    this.sprite.x = this.x;
    this.sprite.y = this.y;

    this._createExclamationMark();
  }

  _drawFallbackSprite() {
    const g = new PIXI.Graphics();
    const isGuardian = this.isGuardian;
    const guardianHex = this.guardianColor ? (GUARDIAN_COLORS[this.guardianColor] ?? 0x445566) : 0x445566;
    const bodyColor = isGuardian ? guardianHex : 0x445566;
    const headColor = isGuardian ? guardianHex : 0x667788;
    const guardianScale = isGuardian ? (this.name === 'PR' ? GUARDIAN_SIZE_SCALE_PR : GUARDIAN_SIZE_SCALE) : 1;
    const spriteH = isGuardian ? (SPRITE_HEIGHT + 16) * guardianScale : SPRITE_HEIGHT;
    const bodyW = isGuardian ? 64 : 56;

    g.beginFill(bodyColor, 0.85);
    g.drawRoundedRect(-bodyW / 2, -spriteH, bodyW, spriteH, 8);
    g.endFill();
    g.beginFill(headColor, 0.9);
    g.drawCircle(0, -spriteH + 22, isGuardian ? 20 : 16);
    g.endFill();
    this.sprite.addChild(g);

    const label = new PIXI.Text(this.name, {
      fontFamily: 'Arial',
      fontSize: isGuardian ? 13 : 12,
      fontWeight: isGuardian ? 'bold' : 'normal',
      fill: 0xffffff,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 60,
    });
    label.anchor.set(0.5, 0);
    label.y = -spriteH + 48;
    this.sprite.addChild(label);
  }

  _applyTextureScale(tex, isGuardian = false) {
    const spr = this._spriteImage || this.sprite;
    if (!tex || !spr) return;
    const tw = tex?.width ?? 64;
    const th = tex?.height ?? 96;
    const guardianScale = isGuardian ? (this.name === 'PR' ? GUARDIAN_SIZE_SCALE_PR : GUARDIAN_SIZE_SCALE) : 1;
    let targetH = isGuardian ? (SPRITE_HEIGHT + 16) * guardianScale : SPRITE_HEIGHT;
    if (tw <= 1 || th <= 1) {
      spr.width = 64;
      spr.height = targetH;
      return;
    }
    const ratio = th / targetH;
    spr.width = Math.round(tw / ratio);
    spr.height = targetH;
  }

  _addGuardianGlow() {
    const spr = this._spriteImage;
    if (!spr || !this.sprite) return;
    const g = new PIXI.Graphics();
    const w = spr.width * 1.15;
    const h = spr.height * 0.5;
    g.beginFill(0xFFD700, 0.25);
    g.drawEllipse(0, -spr.height * 0.5, w * 0.5, h);
    g.endFill();
    this.sprite.addChildAt(g, 0);
  }

  _addGuardianNameLabel() {
    const spr = this._spriteImage;
    if (!spr || !this.sprite) return;
    const label = new PIXI.Text(this.name || 'CCO', {
      fontFamily: 'Noto Sans KR, Arial',
      fontSize: 14,
      fontWeight: 'bold',
      fill: 0xFFD700,
      align: 'center',
    });
    label.anchor.set(0.5, 1);
    // 관장자 전신 이미지·배경과 겹치지 않도록 라벨을 충분히 위로 (말풍선 겹침 방지)
    const gapAbove = 36;
    label.y = -spr.height - gapAbove;
    this.sprite.addChild(label);
  }

  _createExclamationMark() {
    const container = new PIXI.Container();
    const spriteH = this._spriteImage?.height ?? (this.isGuardian ? SPRITE_HEIGHT + 16 : SPRITE_HEIGHT);
    container.x = 0;
    container.y = -spriteH - 12;

    const bg = new PIXI.Graphics();
    bg.beginFill(0xffffff, 0.95);
    bg.drawRoundedRect(-14, -14, 28, 28, 14);
    bg.endFill();
    container.addChild(bg);

    const text = new PIXI.Text('💬', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 18,
      align: 'center',
    });
    text.anchor.set(0.5, 0.5);
    text.x = 0;
    text.y = 0;
    container.addChild(text);

    container.visible = false;
    this.sprite.addChild(container);
    this._exclamationMark = container;

    // Bounce animation via ticker
    this._bouncePhase = 0;
  }

  isPlayerInRange(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.interactionRadius;
  }

  showInteractionHint(show) {
    if (!this._exclamationMark) return;
    this._exclamationMark.visible = !!show;
    if (show) {
      this._startBounce();
    } else {
      this._stopBounce();
    }
  }

  _startBounce() {
    if (this._bounceId) return;
    this._bouncePhase = 0;
    const tick = () => {
      this._bounceId = requestAnimationFrame(tick);
      this._bouncePhase += 0.08;
      if (this._exclamationMark) {
        const spriteH = this._spriteImage?.height ?? (this.isGuardian ? SPRITE_HEIGHT + 16 : SPRITE_HEIGHT);
        this._exclamationMark.y = -spriteH - 12 + Math.sin(this._bouncePhase) * 4;
      }
    };
    tick();
  }

  _stopBounce() {
    if (this._bounceId) {
      cancelAnimationFrame(this._bounceId);
      this._bounceId = null;
    }
    if (this._exclamationMark) {
      const spriteH = this._spriteImage?.height ?? (this.isGuardian ? SPRITE_HEIGHT + 16 : SPRITE_HEIGHT);
      this._exclamationMark.y = -spriteH - 12;
    }
  }

  onDialogueComplete() {
    this.hasSpoken = true;
    this.showInteractionHint(false);
  }
}
