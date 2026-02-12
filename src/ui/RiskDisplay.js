/**
 * RiskDisplay (UI) — 상단 HUD에 등급 텍스트 + 게이지 바.
 * 상태 변경 시 CSS transition으로 부드럽게 갱신.
 */
export class RiskDisplay {
  constructor(container) {
    this.container = container || document.body;
    this.el = null;
    this._chaosBar = null;
    this._extBar = null;
    this._chaosLabel = null;
    this._extLabel = null;
  }

  update(internalGrade, externalGrade, chaosPercent = 0, extPercent = 0) {
    if (!this.el) this._create();

    // 등급 텍스트 갱신
    if (this._chaosLabel) {
      this._chaosLabel.textContent = internalGrade || '안정';
      this._chaosLabel.style.color = this._getGradeColor(chaosPercent);
    }
    if (this._extLabel) {
      this._extLabel.textContent = externalGrade || '낮음';
      this._extLabel.style.color = this._getGradeColor(extPercent);
    }

    // 게이지 바 갱신
    if (this._chaosBar) {
      this._chaosBar.style.width = Math.min(100, Math.max(0, chaosPercent)) + '%';
      this._chaosBar.style.background = this._getBarGradient(chaosPercent);
    }
    if (this._extBar) {
      this._extBar.style.width = Math.min(100, Math.max(0, extPercent)) + '%';
      this._extBar.style.background = this._getBarGradient(extPercent);
    }
  }

  _getGradeColor(percent) {
    if (percent >= 75) return '#e74c3c';
    if (percent >= 50) return '#f39c12';
    if (percent >= 25) return '#f1c40f';
    return '#2ecc71';
  }

  _getBarGradient(percent) {
    if (percent >= 75) return 'linear-gradient(90deg, #e74c3c, #c0392b)';
    if (percent >= 50) return 'linear-gradient(90deg, #f39c12, #e74c3c)';
    if (percent >= 25) return 'linear-gradient(90deg, #f1c40f, #f39c12)';
    return 'linear-gradient(90deg, #2ecc71, #27ae60)';
  }

  _create() {
    this.el = document.createElement('div');
    this.el.className = 'risk-display';
    this.el.style.cssText = `
      display: flex;
      gap: 16px;
      align-items: center;
    `;

    // 조직 혼란 게이지
    const chaosGroup = this._createGauge('조직 혼란', 'chaos');
    this._chaosLabel = chaosGroup.label;
    this._chaosBar = chaosGroup.bar;

    // 대외 위험 게이지
    const extGroup = this._createGauge('대외 위험', 'external');
    this._extLabel = extGroup.label;
    this._extBar = extGroup.bar;

    this.el.appendChild(chaosGroup.el);
    this.el.appendChild(extGroup.el);
    this.container.appendChild(this.el);
  }

  _createGauge(labelText, type) {
    const el = document.createElement('div');
    el.className = `gauge ${type}`;
    el.style.cssText = 'display:flex;flex-direction:column;gap:3px;';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:8px;';

    const nameEl = document.createElement('span');
    nameEl.textContent = labelText;
    nameEl.style.cssText = 'font-size:11px;color:#999;';

    const label = document.createElement('span');
    label.style.cssText = 'font-size:12px;font-weight:700;color:#2ecc71;transition:color 0.3s;';
    label.textContent = type === 'chaos' ? '안정' : '낮음';

    header.appendChild(nameEl);
    header.appendChild(label);
    el.appendChild(header);

    const barWrap = document.createElement('div');
    barWrap.style.cssText = 'width:100px;height:6px;background:rgba(0,0,0,0.5);border-radius:3px;overflow:hidden;';

    const bar = document.createElement('div');
    bar.style.cssText = 'height:100%;width:0%;border-radius:3px;transition:width 0.4s ease, background 0.4s ease;background:linear-gradient(90deg,#2ecc71,#27ae60);';

    barWrap.appendChild(bar);
    el.appendChild(barWrap);

    return { el, label, bar };
  }
}
