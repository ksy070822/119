/**
 * 전역 상태 (EventEmitter 패턴)
 * 게임 상태, 리스크, 스테이지, 선택 로그 관리
 */
export class StateManager {
  constructor() {
    this._listeners = {};
    this._state = {
      stage: 1,
      internalChaos: 0,
      externalRisk: 0,
      confusionPeak: 0,
      promiseRiskCount: 0,
      scopeClarityScore: 0,
      items: [true, false, false, false, false],
      itemSources: [null, null, null, null, null],
      choiceLog: [],
      elapsedMinutes: 0,
      selectedJob: null,
      allies: [],
      guardianShownThisStage: false,
    };
  }

  get state() {
    return { ...this._state };
  }

  get(key) {
    return this._state[key];
  }

  set(updates) {
    const prev = { ...this._state };
    Object.assign(this._state, updates);
    this._emit('stateChange', { prev, next: this._state });
    Object.keys(updates).forEach((k) => this._emit(`change:${k}`, updates[k]));
  }

  /** 인벤토리에 아이템 추가 (동료 상담 후). sourceCharId = 아이템을 준 동료 캐릭터 id (getItemImage용) */
  addItem(itemId, sourceCharId) {
    const items = [...(this._state.items ?? [true, false, false, false, false])];
    const sources = [...(this._state.itemSources ?? [this._state.selectedJob, null, null, null, null])];
    const idx = items.findIndex((filled, i) => !filled && i > 0);
    if (idx !== -1) {
      items[idx] = true;
      sources[idx] = sourceCharId ?? itemId;
      this.set({ items, itemSources: sources });
    }
  }

  /** 대화 선택 effects 반영 (internalChaos, externalRisk, promiseRisk) */
  applyEffects(effects) {
    if (!effects || typeof effects !== 'object') return;
    const c = (this._state.internalChaos ?? 0) + (effects.internalChaos ?? 0);
    const e = (this._state.externalRisk ?? 0) + (effects.externalRisk ?? 0);
    const pr = (this._state.promiseRiskCount ?? 0) + (effects.promiseRisk ? 1 : 0);
    const confusionPeak = this._state.confusionPeak ?? 0;
    const tier = (v) => Math.min(4, Math.floor(Math.max(0, Math.min(100, v)) / 20));
    const newPeak = Math.max(confusionPeak, tier(c));
    this.set({
      internalChaos: Math.max(0, Math.min(100, c)),
      externalRisk: Math.max(0, Math.min(100, e)),
      promiseRiskCount: pr,
      confusionPeak: newPeak,
    });
  }

  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  }

  off(event, fn) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter((f) => f !== fn);
  }

  _emit(event, data) {
    (this._listeners[event] || []).forEach((fn) => fn(data));
  }

  reset() {
    this._state = {
      stage: 1,
      internalChaos: 0,
      externalRisk: 0,
      confusionPeak: 0,
      promiseRiskCount: 0,
      scopeClarityScore: 0,
      items: [true, false, false, false, false],
      itemSources: [null, null, null, null, null],
      choiceLog: [],
      elapsedMinutes: 0,
      selectedJob: null,
      allies: [],
      guardianShownThisStage: false,
    };
  }
}
