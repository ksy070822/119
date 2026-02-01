/**
 * CheckpointOverlay — choice.checkpoint === true일 때만 확인 오버레이.
 * 리스크 미리보기 + "이대로 진행" / "다른 선택 검토".
 */
export class CheckpointOverlay {
  constructor(container) {
    this.container = container || document.body;
    this.el = null;
  }

  show(choice) {
    if (!this.el) this._create();
    const riskPreview = choice?.riskPreview
      ? `조직 혼란: ${choice.riskPreview.internalChaos ?? '-'} / 대외 위험: ${choice.riskPreview.externalRisk ?? '-'}`
      : '예상 리스크 변화를 확인하세요.';
    this.el.innerHTML = `
      <div class="checkpoint-box" style="background:#222;padding:24px;border-radius:12px;max-width:400px;">
        <div class="title" style="font-weight:700;margin-bottom:12px;">결정 확인</div>
        <p class="risk-preview" style="margin-bottom:8px;">${riskPreview}</p>
        <p class="desc" style="font-size:14px;opacity:0.9;">이대로 진행할까요? 수정해도 불이익은 없습니다.</p>
        <div class="checkpoint-buttons" style="margin-top:16px;display:flex;gap:8px;">
          <button class="btn-edit" id="checkpoint-edit">다른 선택 검토</button>
          <button class="btn-confirm" id="checkpoint-confirm">이대로 진행</button>
        </div>
      </div>
    `;
    this.el.style.display = 'flex';
  }

  hide() {
    if (this.el) this.el.style.display = 'none';
  }

  waitForResponse() {
    return new Promise((resolve) => {
      if (!this.el) return resolve(false);
      this.el.querySelector('#checkpoint-edit')?.addEventListener('click', () => {
        this.hide();
        resolve(false);
      }, { once: true });
      this.el.querySelector('#checkpoint-confirm')?.addEventListener('click', () => {
        this.hide();
        resolve(true);
      }, { once: true });
    });
  }

  _create() {
    this.el = document.createElement('div');
    this.el.className = 'checkpoint-overlay';
    this.el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:none;align-items:center;justify-content:center;z-index:40;pointer-events:auto;';
    this.container.appendChild(this.el);
  }
}
