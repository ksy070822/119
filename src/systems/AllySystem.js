/**
 * 동료 보완 이벤트: 리스크 조건 충족 시 자동 등장, 슬라이드 인 + 대사 + 리스크 완화
 */
import alliesData from '../data/allies.json';

export class AllySystem {
  constructor(stateManager) {
    this.state = stateManager;
  }

  getAllies() {
    return alliesData.allies ?? [];
  }

  getTriggeredAllies(stageId, lastChoiceId, internalChaos, externalRisk) {
    const allies = this.getAllies();
    const recruited = this.state.get('allies') ?? [];
    return allies.filter((a) => {
      if (recruited.includes(a.id)) return false;
      if (a.stageId !== stageId) return false;
      const trigger = a.trigger ?? {};
      if (trigger.afterChoiceIds && !trigger.afterChoiceIds.includes(lastChoiceId)) return false;
      const gate = trigger.riskGate ?? {};
      if (gate.internalChaosAtLeast != null) {
        const tier = this._chaosTier(internalChaos);
        const required = this._tierFromLabel(gate.internalChaosAtLeast);
        if (tier < required) return false;
      }
      if (gate.externalRiskAtLeast != null) {
        const tier = this._externalTier(externalRisk);
        const required = this._tierFromLabel(gate.externalRiskAtLeast);
        if (tier < required) return false;
      }
      return true;
    });
  }

  _chaosTier(v) {
    if (v < 20) return 0;
    if (v < 40) return 1;
    if (v < 60) return 2;
    if (v < 80) return 3;
    return 4;
  }

  _externalTier(v) {
    if (v < 20) return 0;
    if (v < 40) return 1;
    if (v < 60) return 2;
    if (v < 80) return 3;
    return 4;
  }

  _tierFromLabel(label) {
    const map = { 안정: 0, 경미: 1, 병목: 2, 혼선: 3, 과부하: 4, 낮음: 0, 주의: 1, 부담: 2, 위험: 3, 임계: 4 };
    return map[label] ?? 0;
  }

  recruit(allyId) {
    const allies = this.state.get('allies') ?? [];
    if (allies.includes(allyId)) return;
    allies.push(allyId);
    const items = [...(this.state.get('items') ?? [true, false, false, false, false])];
    const itemSources = [...(this.state.get('itemSources') ?? [null, null, null, null, null])];
    const firstEmpty = items.indexOf(false);
    if (firstEmpty !== -1) {
      items[firstEmpty] = true;
      itemSources[firstEmpty] = allyId;
      this.state.set({ allies, items, itemSources });
    } else {
      this.state.set({ allies });
    }
  }
}
