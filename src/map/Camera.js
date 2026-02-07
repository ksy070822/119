/**
 * Camera — follow(targetX, targetY, lerp), applyTo(container), 맵 경계 클램프.
 */
export class Camera {
  constructor(viewWidth, viewHeight) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.x = 0;
    this.y = 0;
    this.lerp = 0.1;
  }

  follow(targetX, targetY, lerp = this.lerp) {
    this.x += (targetX - this.x) * lerp;
    this.y += (targetY - this.y) * lerp;
  }

  clamp(mapWidth, mapHeight) {
    const halfW = this.viewWidth / 2;
    const halfH = this.viewHeight / 2;
    this.x = Math.max(halfW, Math.min(mapWidth - halfW, this.x));
    this.y = Math.max(halfH, Math.min(mapHeight - halfH, this.y));
  }

  applyTo(container) {
    if (container) {
      container.x = -this.x + this.viewWidth / 2;
      container.y = -this.y + this.viewHeight / 2;
    }
  }
}
