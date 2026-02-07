/**
 * TimelineLog — 타임라인/로그 UI. 기존 DOM 로직 이전/분리용.
 */
export class TimelineLog {
  constructor(container) {
    this.container = container || document.body;
    this.el = null;
  }

  append(message) {
    if (!this.el) this._create();
    const line = document.createElement('div');
    line.textContent = message;
    this.el.appendChild(line);
  }

  _create() {
    this.el = document.createElement('div');
    this.el.className = 'timeline-log';
    this.el.style.cssText = 'position:fixed;top:56px;right:16px;max-width:280px;max-height:200px;overflow:auto;background:rgba(0,0,0,0.6);color:#fff;padding:8px;font-size:12px;';
    this.container.appendChild(this.el);
  }
}
