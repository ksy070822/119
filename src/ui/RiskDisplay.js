/**
 * RiskDisplay (UI) — 상단 HUD에 등급 텍스트 + 게이지 바. 상태 변경 시 GSAP 또는 transition.
 */
export class RiskDisplay {
  constructor(container) {
    this.container = container || document.body;
    this.el = null;
  }

  update(internalGrade, externalGrade) {
    if (!this.el) this._create();
    // TODO: 등급 텍스트 + 게이지 바 갱신
  }

  _create() {
    this.el = document.createElement('div');
    this.el.className = 'risk-display';
    this.container.appendChild(this.el);
  }
}
