/**
 * HUD — 상단 HUD (리스크, 시간 등). 기존 DOM 로직 이전/분리용.
 */
export class HUD {
  constructor(container) {
    this.container = container || document.body;
    this.el = null;
  }

  show() {
    if (!this.el) this._create();
    this.el.style.display = 'block';
  }

  hide() {
    if (this.el) this.el.style.display = 'none';
  }

  _create() {
    this.el = document.createElement('div');
    this.el.className = 'hud';
    this.el.style.cssText = 'position:fixed;top:0;left:0;right:0;height:48px;background:rgba(0,0,0,0.5);color:#fff;display:flex;align-items:center;padding:0 16px;';
    this.container.appendChild(this.el);
  }
}
