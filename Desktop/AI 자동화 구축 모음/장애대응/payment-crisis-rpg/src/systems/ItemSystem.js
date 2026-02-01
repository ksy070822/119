/**
 * 아이템: 시작 시 기본 1개, 동료 만날 때마다 보조 1개(최대 4), 총 5개 시 궁극 발동
 */
export class ItemSystem {
  constructor(stateManager) {
    this.state = stateManager;
  }

  getSlots() {
    return [...(this.state.get('items') ?? [true, false, false, false, false])];
  }

  countFilled() {
    return this.getSlots().filter(Boolean).length;
  }

  isComplete() {
    return this.countFilled() >= 5;
  }

  addItem() {
    const items = this.getSlots();
    const idx = items.indexOf(false);
    if (idx === -1) return false;
    items[idx] = true;
    this.state.set({ items });
    return true;
  }

  acquire(itemId, sourceId) {
    const items = this.getSlots();
    const sources = [...(this.state.get('itemSources') ?? [null, null, null, null, null])];
    const idx = items.indexOf(false);
    if (idx === -1) return false;
    items[idx] = true;
    sources[idx] = sourceId;
    this.state.set({ items, itemSources: sources });
    return true;
  }
}
