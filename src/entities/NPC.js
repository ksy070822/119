/**
 * NPC (v3) — id, x, y, showExclamation(), hideExclamation()
 */
export class NPC {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.element = null;
    this._exclamationEl = null;
  }

  showExclamation() {
    if (this._exclamationEl) {
      this._exclamationEl.style.display = 'block';
      this._exclamationEl.classList.add('npc-exclamation--show');
    }
  }

  hideExclamation() {
    if (this._exclamationEl) {
      this._exclamationEl.style.display = 'none';
      this._exclamationEl.classList.remove('npc-exclamation--show');
    }
  }

  setExclamationElement(el) {
    this._exclamationEl = el;
  }
}
