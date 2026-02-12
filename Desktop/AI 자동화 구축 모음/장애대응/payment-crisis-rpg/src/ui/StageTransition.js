/**
 * 스테이지 전환 — 전체 화면 이미지 + "상황이 변화하고 있습니다..." + 파티클 연출
 */
export class StageTransition {
  constructor(container) {
    this.container = container || document.body;
  }

  async show(imagePath, duration = 2000, stageLevel = 1) {
    const raw = imagePath.startsWith('/') ? imagePath : `/assets/maps/${imagePath}`;
    const src = encodeURI(raw);
    const overlay = document.createElement('div');
    overlay.className = 'stage-transition';
    overlay.innerHTML = `
      <img src="${src}" alt="Stage" onerror="this.style.display='none'"/>
      <div class="stage-transition__text">상황이 변화하고 있습니다...</div>
    `;
    overlay.style.cssText =
      'position:fixed;top:0;left:0;right:0;bottom:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:1000;overflow:hidden;';
    overlay.querySelector('img').style.cssText = 'max-width:100%;max-height:80vh;object-fit:contain;';
    const textEl = overlay.querySelector('.stage-transition__text');
    textEl.style.cssText = 'margin-top:20px;color:#fff;font-size:18px;';
    this.container.appendChild(overlay);

    // 파티클 더스트 효과
    this._addTransitionParticles(overlay, stageLevel);

    if (typeof gsap !== 'undefined') {
      overlay.style.opacity = '0';
      await gsap.to(overlay, { opacity: 1, duration: 0.5 });
    }
    await this.wait(duration);
    if (typeof gsap !== 'undefined') {
      await gsap.to(overlay, { opacity: 0, duration: 0.5 });
    }
    overlay.remove();
  }

  _addTransitionParticles(container, stageLevel) {
    const stageColors = {
      1: ['#2ecc71', '#27ae60'],
      2: ['#f1c40f', '#f39c12'],
      3: ['#e67e22', '#d35400'],
      4: ['#e74c3c', '#c0392b'],
      5: ['#2ecc71', '#3498db'],
    };
    const colors = stageColors[stageLevel] || stageColors[1];

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 3 + Math.random() * 6;
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${100 + Math.random() * 20}%;
        opacity: 0;
        pointer-events: none;
      `;
      container.appendChild(particle);

      particle.animate([
        { transform: 'translateY(0) scale(1)', opacity: 0.6 },
        { transform: `translateY(-${200 + Math.random() * 300}px) scale(0.3)`, opacity: 0 },
      ], {
        duration: 1500 + Math.random() * 1000,
        delay: Math.random() * 800,
        fill: 'forwards',
      });
    }
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
