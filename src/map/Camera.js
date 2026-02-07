/**
 * Camera — follow(targetX, targetY, lerp), applyTo(container), 맵 경계 클램프.
 * offsetX: 좌측 패널 등으로 인한 뷰포트 오프셋 보정.
 */
export class Camera {
  constructor(viewWidth, viewHeight, offsetX = 0) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.offsetX = offsetX;
    this.x = 0;
    this.y = 0;
    this.lerp = 0.1;
  }

  follow(targetX, targetY, lerp = this.lerp) {
    this.x += (targetX - this.x) * lerp;
    this.y += (targetY - this.y) * lerp;
  }

  clamp(mapWidth, mapHeight) {
    // 실제 보이는 영역 너비 (전체 캔버스 - 좌측 패널 오프셋)
    const effectiveW = this.viewWidth - this.offsetX;
    const effectiveH = this.viewHeight;
    const halfW = effectiveW / 2;
    const halfH = effectiveH / 2;

    // 맵이 보이는 영역보다 작으면 맵 중앙에 고정
    if (mapWidth <= effectiveW) {
      this.x = mapWidth / 2;
    } else {
      this.x = Math.max(halfW, Math.min(mapWidth - halfW, this.x));
    }
    if (mapHeight <= effectiveH) {
      this.y = mapHeight / 2;
    } else {
      this.y = Math.max(halfH, Math.min(mapHeight - halfH, this.y));
    }
  }

  applyTo(container) {
    if (container) {
      // 좌측 패널 오프셋을 고려하여 보이는 영역 중앙에 맵 배치
      const effectiveW = this.viewWidth - this.offsetX;
      container.x = -this.x + this.offsetX + effectiveW / 2;
      container.y = -this.y + this.viewHeight / 2;
    }
  }
}
