/**
 * 플레이어 캐릭터 (v3) — x, y, canMove, setPosition. DOM 또는 Pixi 스프라이트.
 */
export class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.canMove = true;
    this.element = null;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    if (this.element) {
      this.element.style.left = `${x}px`;
      this.element.style.top = `${y}px`;
    }
    if (this.sprite) {
      this.sprite.x = x;
      this.sprite.y = y;
    }
  }
}
