/**
 * 선택지 패널 (v3) — show(choices, onSelect) 콜백으로 선택 전달
 */
export class ChoicePanel {
  constructor(container) {
    this.container = container || document.body;
    this.el = null;
  }

  show(choices, onSelect) {
    if (!this.el) this._create();
    this.el.innerHTML = '';
    this._onSelect = onSelect;
    (choices || []).forEach((c) => {
      const btn = document.createElement('button');
      btn.className = 'choice-panel__btn';
      btn.textContent = c.text;
      btn.addEventListener('click', () => {
        if (this._onSelect) this._onSelect(c);
      });
      this.el.appendChild(btn);
    });
    this.el.style.display = 'block';
  }

  hide() {
    if (this.el) this.el.style.display = 'none';
    this._onSelect = null;
  }

  _create() {
    this.el = document.createElement('div');
    this.el.className = 'choice-panel';
    this.el.style.cssText =
      'position:fixed;bottom:120px;left:50%;transform:translateX(-50%);display:none;pointer-events:auto;z-index:31;background:rgba(0,0,0,0.9);color:#fff;padding:16px;border-radius:12px;max-width:90%;max-height:50vh;overflow-y:auto;';
    this.container.appendChild(this.el);
  }
}
