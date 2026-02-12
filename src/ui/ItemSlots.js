/**
 * ItemSlots (UI) — 좌측 하단 또는 좌측 패널 5슬롯.
 * 채워진 슬롯은 아이템 이미지, 빈 슬롯은 비어있는 프레임.
 */
import { getItemImage } from '../data/assetPaths.js';

export class ItemSlots {
  constructor(container, slotCount = 5) {
    this.container = container || document.body;
    this.slotCount = slotCount;
    this.el = null;
  }

  setItems(items) {
    if (!this.el) this._create();
    this.el.innerHTML = '';

    for (let i = 0; i < this.slotCount; i++) {
      const slot = document.createElement('div');
      slot.className = 'item-slot-ui';
      slot.style.cssText = `
        width: 56px;
        height: 56px;
        border-radius: 8px;
        background: rgba(0,0,0,0.4);
        border: 1px solid rgba(255,255,255,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        overflow: hidden;
      `;

      const item = items?.[i];
      if (item) {
        slot.style.borderColor = '#d4af37';
        slot.style.background = 'rgba(212,175,55,0.15)';
        slot.style.boxShadow = '0 0 8px rgba(212,175,55,0.3)';

        const imgSrc = item.image || (item.charId ? getItemImage(item.charId, item.slotIndex ?? 0) : null);
        if (imgSrc) {
          const img = document.createElement('img');
          img.src = imgSrc;
          img.alt = item.name || '';
          img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
          img.onerror = () => {
            img.style.display = 'none';
            slot.textContent = item.icon || '📦';
            slot.style.fontSize = '24px';
          };
          slot.appendChild(img);
        } else {
          slot.textContent = item.icon || '📦';
          slot.style.fontSize = '18px';
        }
      }

      this.el.appendChild(slot);
    }
  }

  _create() {
    this.el = document.createElement('div');
    this.el.className = 'item-slots';
    this.el.style.cssText = 'position:fixed;bottom:16px;left:16px;display:flex;gap:10px;z-index:10;';
    this.container.appendChild(this.el);
  }
}
