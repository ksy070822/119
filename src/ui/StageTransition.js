/**
 * 스테이지 전환 — 전체 화면 이미지 + "상황이 변화하고 있습니다..."
 */
export class StageTransition {
  constructor(container) {
    this.container = container || document.body;
  }

  async show(imagePath, duration = 2000) {
    const raw = imagePath.startsWith('/') ? imagePath : `/assets/maps/${imagePath}`;
    const src = encodeURI(raw);
    const overlay = document.createElement('div');
    overlay.className = 'stage-transition';
    overlay.innerHTML = `
      <img src="${src}" alt="Stage" onerror="this.style.display='none'"/>
      <div class="stage-transition__text">상황이 변화하고 있습니다...</div>
    `;
    overlay.style.cssText =
      'position:fixed;top:0;left:0;right:0;bottom:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:1000;';
    overlay.querySelector('img').style.maxWidth = '100%';
    overlay.querySelector('img').style.maxHeight = '80vh';
    overlay.querySelector('img').style.objectFit = 'contain';
    const textEl = overlay.querySelector('.stage-transition__text');
    textEl.style.marginTop = '20px';
    textEl.style.color = '#fff';
    textEl.style.fontSize = '18px';
    this.container.appendChild(overlay);

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

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
