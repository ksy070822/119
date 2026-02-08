/**
 * ScreenEffects — 화면 흔들림, 플래시, 필살기 연출 (DOM 오버레이).
 */
import { MAGIC_CIRCLE, PARTICLE_SPARK } from '../data/assetPaths.js';

export class ScreenEffects {
  constructor(container) {
    this.container = container || document.body;
    this._shakeEl = null;
  }

  shake(duration = 300) {
    const wrap = document.getElementById('game-canvas-wrap');
    const el = wrap || this.container;
    if (!el) return;
    el.style.transition = 'none';
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = `screen-shake ${duration}ms ease-in-out`;
    setTimeout(() => {
      el.style.animation = '';
    }, duration);
  }

  flash(color, duration = 200) {
    const overlay = document.createElement('div');
    overlay.className = 'screen-flash-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; pointer-events: none; z-index: 9999;
      background: ${color}; opacity: 0;
      transition: opacity ${duration / 2}ms ease-out;
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.style.opacity = '0.4';
      setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.transition = `opacity ${duration / 2}ms ease-in`;
        setTimeout(() => overlay.remove(), duration / 2);
      }, duration / 2);
    });
  }

  redFlash(duration = 200) {
    this.flash('rgba(255, 50, 50, 0.5)', duration);
  }

  calmGlow(duration = 400) {
    this.flash('rgba(100, 180, 255, 0.25)', duration);
  }

  /** 필살기 연출: magic_circle 회전 + screenFlash + particles_spark */
  async playSkillEffect(x, y) {
    const cx = x ?? window.innerWidth / 2;
    const cy = y ?? window.innerHeight / 2;
    const overlay = document.createElement('div');
    overlay.className = 'skill-effect-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; pointer-events: none; z-index: 9998;
      display: flex; align-items: center; justify-content: center;
    `;
    const circle = document.createElement('img');
    circle.src = MAGIC_CIRCLE;
    circle.alt = '';
    circle.style.cssText = `
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      width: 120px; height: 120px; opacity: 0.8;
      animation: skill-magic-circle-spin 0.6s linear infinite;
    `;
    circle.onerror = () => { circle.style.display = 'none'; };
    overlay.appendChild(circle);

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const tx = Math.cos(angle) * 80;
      const ty = Math.sin(angle) * 80;
      const spark = document.createElement('div');
      spark.style.cssText = `
        position: absolute; left: ${cx}px; top: ${cy}px; width: 10px; height: 10px;
        background: radial-gradient(circle, rgba(255,255,220,0.95) 0%, transparent 70%);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: skill-spark-out 0.5s ease-out forwards;
      `;
      spark.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.3)`, opacity: 0 },
      ], { duration: 500, fill: 'forwards' });
      overlay.appendChild(spark);
    }

    document.body.appendChild(overlay);
    this.flash('rgba(200, 220, 255, 0.5)', 150);

    await new Promise((r) => setTimeout(r, 500));
    overlay.remove();
  }

  vignette(intensity) {
  }
}
