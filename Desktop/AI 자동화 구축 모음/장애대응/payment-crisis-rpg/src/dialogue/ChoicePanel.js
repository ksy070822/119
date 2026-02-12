/**
 * ChoicePanel (DOM) — 대화 중 type: "choice"일 때만 표시.
 * 각 버튼에 text + preview. 클릭 시 onChoiceSelected(choice) → Checkpoint 필요 시 CheckpointOverlay, 아니면 바로 effects 적용 후 response 단계로.
 */
export class ChoicePanel {
  constructor(container) {
    this.container = container || document.body;
    this.el = null;
    this.onChoiceSelected = null;
  }

  show(choices) {
    if (!this.el) this._create();
    this.el.innerHTML = '';
    (choices || []).forEach((c) => {
      const btn = document.createElement('button');
      btn.style.cssText = 'display:block;width:100%;margin:6px 0;padding:10px 16px;text-align:left;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:8px;color:#fff;cursor:pointer;';
      btn.textContent = c.text;
      btn.addEventListener('click', () => this.onChoiceSelected && this.onChoiceSelected(c));
      this.el.appendChild(btn);
    });
    this.el.style.display = 'block';
  }

  hide() {
    if (this.el) this.el.style.display = 'none';
  }

  _create() {
    this.el = document.createElement('div');
    this.el.className = 'choice-panel';
    this.el.style.cssText = 'position:fixed;bottom:140px;left:50%;transform:translateX(-50%);display:none;pointer-events:auto;z-index:31;background:rgba(0,0,0,0.9);color:#fff;padding:16px;border-radius:12px;max-width:90%;';
    this.container.appendChild(this.el);
  }
}
