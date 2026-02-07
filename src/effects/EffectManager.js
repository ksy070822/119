/**
 * EffectManager — PixiJS 컨테이너 또는 DOM. play('DANGER_SPARK'), play('CALM_GLOW') 등.
 */
export class EffectManager {
  constructor(container) {
    this.container = container;
    this.active = new Map();
  }

  play(name) {
    this.active.set(name, true);
    // TODO: 파티클/이펙트 재생
  }

  stop(name) {
    this.active.delete(name);
  }
}
