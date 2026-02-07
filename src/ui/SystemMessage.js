/**
 * 시스템 메시지 — 인트로/안내 문구 표시
 */
export class SystemMessage {
  constructor(container) {
    this.container = container || document.body;
    this.element = null;
  }

  show(text) {
    if (this.element) this.element.remove();
    this.element = document.createElement('div');
    this.element.className = 'system-message';
    this.element.textContent = text;
    this.element.style.cssText =
      'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.85);color:#fff;padding:20px 40px;border-radius:12px;font-size:18px;z-index:30;max-width:90%;text-align:center;';
    this.container.appendChild(this.element);
    if (typeof gsap !== 'undefined') {
      gsap.from(this.element, { opacity: 0, scale: 0.9, duration: 0.3 });
    }
  }

  hide() {
    if (!this.element) return Promise.resolve();
    if (typeof gsap !== 'undefined') {
      return gsap.to(this.element, { opacity: 0, duration: 0.2 }).then(() => {
        this.element?.remove();
        this.element = null;
      });
    }
    this.element.remove();
    this.element = null;
    return Promise.resolve();
  }
}
