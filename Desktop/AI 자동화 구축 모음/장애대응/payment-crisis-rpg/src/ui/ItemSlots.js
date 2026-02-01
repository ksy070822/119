/**
 * ItemSlots (UI) — 좌측 하단 또는 좌측 패널 5슬롯. 채워진 슬롯은 itemId별 이미지.
 */
export class ItemSlots {
  constructor(container, slotCount = 5) {
    this.container = container || document.body;
    this.slotCount = slotCount;
    this.el = null;
  }

  setItems(items) {
    if (!this.el) this._create();
    // TODO: items 배열으로 슬롯 채우기
  }

  _create() {
    this.el = document.createElement('div');
    this.el.className = 'item-slots';
    this.el.style.cssText = 'position:fixed;bottom:16px;left:16px;display:flex;gap:8px;';
    this.container.appendChild(this.el);
  }
}
