/**
 * Player — PixiJS 캐릭터 스프라이트 (idle.png, walk_*), 방향별 전환, 이동 시 흔들림, 그림자.
 * 발 기준 anchor (0.5, 1). container = shadow + sprite.
 */
import * as PIXI from 'pixi.js';
import { Assets } from 'pixi.js';
import { CHARACTERS } from '../data/characters.js';

const SPRITE_HEIGHT = 96;
const SHADOW_WIDTH = 40;
const SHADOW_HEIGHT = 12;
const BOB_AMPLITUDE = 4;
const BOB_SPEED = 0.25;

const ARRIVAL_DISTANCE = 35;

export class Player {
  constructor(speed = 4, characterId = 'communicator') {
    this.speed = speed;
    this.characterId = characterId;
    this.x = 0;
    this.y = 0;
    this.direction = { x: 0, y: 0 };
    this.canMove = true;
    this.bobPhase = 0;
    this._moving = false;
    this._walkToTarget = null;

    this.container = new PIXI.Container();

    this.shadow = new PIXI.Graphics();
    this._drawShadow();
    this.container.addChild(this.shadow);

    this.sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.sprite.anchor.set(0.5, 1);
    this.sprite.width = 64;
    this.sprite.height = SPRITE_HEIGHT;
    this.container.addChild(this.sprite);

    this._textures = {};
    this._loadTextures();
  }

  _drawShadow() {
    this.shadow.clear();
    this.shadow.beginFill(0x000000, 0.35);
    this.shadow.drawEllipse(0, 4, SHADOW_WIDTH / 2, SHADOW_HEIGHT / 2);
    this.shadow.endFill();
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

  _loadTextures() {
    const char = CHARACTERS[this.characterId];
    if (!char?.sprites) return;
    const { idle, walkUp, walkDown, walkLeft, walkRight } = char.sprites;
    const urls = [idle, walkUp, walkDown, walkLeft, walkRight];
    const keys = ['idle', 'walk_up', 'walk_down', 'walk_left', 'walk_right'];
    const fullUrls = urls.map((u) => (u.startsWith('/') && typeof window !== 'undefined' ? window.location.origin + u : u));
    Promise.all(
      fullUrls.map((u) =>
        Assets.load(u).catch(() => PIXI.Texture.WHITE)
      )
    ).then((texs) => {
      keys.forEach((k, i) => {
        this._textures[k] = texs[i];
      });
      this.sprite.texture = this._textures.idle;
      this._applyTextureScale(this.sprite.texture);
    }).catch(() => {});
  }

  _getPose() {
    if (!this._moving || !this.direction) return 'idle';
    const { x, y } = this.direction;
    if (Math.abs(y) >= Math.abs(x)) return y < 0 ? 'walk_up' : 'walk_down';
    return x < 0 ? 'walk_left' : 'walk_right';
  }

  _setPose(pose) {
    const tex = this._textures[pose] || this._textures.idle;
    if (this.sprite.texture !== tex) this.sprite.texture = tex;
    if (pose === 'walk_left') this.sprite.scale.x = -1;
    else this.sprite.scale.x = 1;
  }

  /** targetX, targetY로 걸어가며, 도착 시 onArrive 콜백 호출 */
  walkTo(targetX, targetY, onArrive) {
    if (this._walkToTarget) return;
    this.canMove = false;
    this._walkToTarget = { x: targetX, y: targetY, onArrive };
  }

  _updateWalkTo(delta = 1) {
    if (!this._walkToTarget) return;
    const { x: tx, y: ty, onArrive } = this._walkToTarget;
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= ARRIVAL_DISTANCE) {
      this._walkToTarget = null;
      this.canMove = true;
      this._moving = false;
      this._setPose('idle');
      this.sprite.y = 0;
      if (typeof onArrive === 'function') onArrive();
      return;
    }
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    this.direction = { x: dx / len, y: dy / len };
    this._moving = true;
    this._setPose(this._getPose());
    this.x += (dx / len) * this.speed * Math.min(1.5, delta);
    this.y += (dy / len) * this.speed * Math.min(1.5, delta);
    this.bobPhase += BOB_SPEED;
    this.sprite.y = Math.sin(this.bobPhase) * BOB_AMPLITUDE;
  }

  isWalkingToTarget() {
    return !!this._walkToTarget;
  }

  update(input) {
    if (this._walkToTarget) {
      this._updateWalkTo();
      this.container.x = this.x;
      this.container.y = this.y;
      return;
    }
    if (!this.canMove || !input) {
      this._moving = false;
      this._setPose('idle');
      this.sprite.y = 0;
      this.container.x = this.x;
      this.container.y = this.y;
      return;
    }
    let dx = 0, dy = 0;
    if (input.isKeyDown('KeyW') || input.isKeyDown('ArrowUp')) dy -= 1;
    if (input.isKeyDown('KeyS') || input.isKeyDown('ArrowDown')) dy += 1;
    if (input.isKeyDown('KeyA') || input.isKeyDown('ArrowLeft')) dx -= 1;
    if (input.isKeyDown('KeyD') || input.isKeyDown('ArrowRight')) dx += 1;
    this._moving = dx !== 0 || dy !== 0;
    if (this._moving) {
      const len = Math.sqrt(dx * dx + dy * dy);
      this.x += (dx / len) * this.speed;
      this.y += (dy / len) * this.speed;
      this.direction = { x: dx / len, y: dy / len };
      this.bobPhase += BOB_SPEED;
      this.sprite.y = Math.sin(this.bobPhase) * BOB_AMPLITUDE;
    } else {
      this._setPose('idle');
      this.sprite.y = 0;
    }
    this._setPose(this._getPose());
    this.container.x = this.x;
    this.container.y = this.y;
  }
}
