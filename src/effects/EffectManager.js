/**
 * EffectManager — PixiJS 컨테이너에 파티클 이펙트 재생.
 * gravity, spread 옵션 지원.
 */
import * as PIXI from 'pixi.js';
import { ParticlePresets } from './ParticlePresets.js';

export class EffectManager {
  constructor(container) {
    this.container = container;
    this.active = new Map();
    this._particles = [];
    this._rafId = null;
  }

  play(name, x, y) {
    if (!this.container || !(this.container instanceof PIXI.Container)) return;
    const preset = ParticlePresets[name] || ParticlePresets.DANGER_SPARK;
    const {
      color = 0xff4444,
      count = 15,
      speed = 1.5,
      radius = 2,
      duration = 600,
      alpha = 0.9,
      gravity = 0,
      spread = Math.PI * 2,
    } = preset;

    const centerX = x ?? (this.container.width / 2 ?? 400);
    const centerY = y ?? (this.container.height / 2 ?? 300);

    for (let i = 0; i < count; i++) {
      const angle = (spread * i) / count + Math.random() * 0.5;
      const spd = speed * (0.7 + Math.random() * 0.6);
      const g = new PIXI.Graphics();
      g.beginFill(color, alpha);
      g.drawCircle(0, 0, radius * (0.5 + Math.random() * 0.5));
      g.endFill();
      g.x = centerX;
      g.y = centerY;
      this.container.addChild(g);
      this._particles.push({
        g,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 0.5,
        life: duration,
        maxLife: duration,
        baseAlpha: alpha,
        gravity,
      });
    }
    this._startUpdateLoop();
  }

  _startUpdateLoop() {
    if (this._rafId) return;
    const tick = () => {
      this._rafId = requestAnimationFrame(tick);
      const dt = 16;
      for (let i = this._particles.length - 1; i >= 0; i--) {
        const p = this._particles[i];
        p.vy += p.gravity || 0;
        p.g.x += p.vx;
        p.g.y += p.vy;
        p.life -= dt;
        const t = p.life / p.maxLife;
        p.g.alpha = Math.max(0, t * p.baseAlpha);
        // Scale down over time
        const scale = 0.3 + 0.7 * t;
        p.g.scale.set(scale);
        if (p.life <= 0) {
          this.container?.removeChild(p.g);
          p.g.destroy();
          this._particles.splice(i, 1);
        }
      }
      if (this._particles.length === 0) {
        cancelAnimationFrame(this._rafId);
        this._rafId = null;
      }
    };
    tick();
  }

  stop(name) {
    this.active.delete(name);
  }

  /** 모든 파티클 즉시 제거 */
  clear() {
    for (const p of this._particles) {
      this.container?.removeChild(p.g);
      p.g.destroy();
    }
    this._particles = [];
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }
}
