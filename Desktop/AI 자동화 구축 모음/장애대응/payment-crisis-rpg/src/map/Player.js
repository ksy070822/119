/**
 * Player — PixiJS 캐릭터 스프라이트 (idle.png, walk_*), 방향별 전환, 이동 시 흔들림, 그림자.
 * 발 기준 anchor (0.5, 1). container = shadow + sprite.
 */
import * as PIXI from 'pixi.js';
import { CHARACTERS } from '../data/characters.js';

const SHADOW_WIDTH = 28;
const SHADOW_HEIGHT = 10;
const BOB_AMPLITUDE = 4;
const BOB_SPEED = 0.25;

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

    this.container = new PIXI.Container();

    this.shadow = new PIXI.Graphics();
    this._drawShadow();
    this.container.addChild(this.shadow);

    this.sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.sprite.anchor.set(0.5, 1);
    this.sprite.width = 32;
    this.sprite.height = 48;
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

  _loadTextures() {
    const char = CHARACTERS[this.characterId];
    if (!char?.sprites) return;
    const { idle, walkUp, walkDown, walkLeft, walkRight } = char.sprites;
    this._textures.idle = PIXI.Texture.from(idle);
    this._textures.walk_up = PIXI.Texture.from(walkUp);
    this._textures.walk_down = PIXI.Texture.from(walkDown);
    this._textures.walk_left = PIXI.Texture.from(walkLeft);
    this._textures.walk_right = PIXI.Texture.from(walkRight);
    this.sprite.texture = this._textures.idle;
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

  update(input) {
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
