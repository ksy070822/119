/**
 * ScreenEffects — 화면 흔들림, 플래시, 필살기 연출, vignette, slowZoom, screenDarken (DOM 오버레이).
 */
import { MAGIC_CIRCLE, PARTICLE_SPARK } from '../data/assetPaths.js';

export class ScreenEffects {
  constructor(container) {
    this.container = container || document.body;
    this._shakeEl = null;
    this._vignetteEl = null;
    this._darkenEl = null;
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

  /** 비네팅 효과 — 화면 가장자리를 어둡게 (보스전 긴장감) */
  vignette(intensity = 0.5, duration = 800) {
    if (this._vignetteEl) this._vignetteEl.remove();

    const el = document.createElement('div');
    el.className = 'screen-vignette-overlay';
    const alpha = Math.min(1, Math.max(0, intensity));
    el.style.cssText = `
      position: fixed; inset: 0; pointer-events: none; z-index: 9990;
      background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${alpha}) 100%);
      opacity: 0;
      transition: opacity ${duration}ms ease;
    `;
    document.body.appendChild(el);
    this._vignetteEl = el;

    requestAnimationFrame(() => {
      el.style.opacity = '1';
    });

    return {
      remove: (fadeDuration = 500) => {
        el.style.transition = `opacity ${fadeDuration}ms ease`;
        el.style.opacity = '0';
        setTimeout(() => {
          el.remove();
          if (this._vignetteEl === el) this._vignetteEl = null;
        }, fadeDuration);
      },
    };
  }

  /** 느린 줌 효과 — 보스 약화 시 연출 */
  slowZoom(targetScale = 1.05, duration = 2000) {
    const wrap = document.getElementById('game-canvas-wrap');
    const el = wrap || this.container;
    if (!el) return;
    el.style.transition = `transform ${duration}ms ease-in-out`;
    el.style.transform = `scale(${targetScale})`;

    return {
      reset: (resetDuration = 1000) => {
        el.style.transition = `transform ${resetDuration}ms ease-out`;
        el.style.transform = 'scale(1)';
      },
    };
  }

  /** 화면 어두워짐 — 위기 고조 시 */
  screenDarken(intensity = 0.5, duration = 600) {
    if (this._darkenEl) this._darkenEl.remove();

    const el = document.createElement('div');
    el.className = 'screen-darken-overlay';
    const alpha = Math.min(0.8, Math.max(0, intensity));
    el.style.cssText = `
      position: fixed; inset: 0; pointer-events: none; z-index: 9991;
      background: rgba(0, 0, 0, ${alpha});
      opacity: 0;
      transition: opacity ${duration}ms ease;
    `;
    document.body.appendChild(el);
    this._darkenEl = el;

    requestAnimationFrame(() => {
      el.style.opacity = '1';
    });

    return {
      remove: (fadeDuration = 400) => {
        el.style.transition = `opacity ${fadeDuration}ms ease`;
        el.style.opacity = '0';
        setTimeout(() => {
          el.remove();
          if (this._darkenEl === el) this._darkenEl = null;
        }, fadeDuration);
      },
    };
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
    circle.src = MAGIC_CIRCLE();
    circle.alt = '';
    circle.style.cssText = `
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      width: 160px; height: 160px; opacity: 0.8;
      animation: skill-magic-circle-spin 0.6s linear infinite;
    `;
    circle.onerror = () => { circle.style.display = 'none'; };
    overlay.appendChild(circle);

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const tx = Math.cos(angle) * 100;
      const ty = Math.sin(angle) * 100;
      const spark = document.createElement('div');
      const colors = ['#FFD700', '#FFA500', '#FFEC8B', '#fff'];
      const color = colors[i % colors.length];
      spark.style.cssText = `
        position: absolute; left: ${cx}px; top: ${cy}px; width: 8px; height: 8px;
        background: radial-gradient(circle, ${color} 0%, transparent 70%);
        border-radius: 50%;
        box-shadow: 0 0 6px ${color};
        transform: translate(-50%, -50%);
      `;
      spark.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.2)`, opacity: 0 },
      ], { duration: 600, fill: 'forwards' });
      overlay.appendChild(spark);
    }

    document.body.appendChild(overlay);
    this.flash('rgba(200, 220, 255, 0.5)', 150);

    await new Promise((r) => setTimeout(r, 600));
    overlay.remove();
  }

  /** 모든 지속 효과 제거 */
  clearAll() {
    this._vignetteEl?.remove();
    this._vignetteEl = null;
    this._darkenEl?.remove();
    this._darkenEl = null;
  }
}
