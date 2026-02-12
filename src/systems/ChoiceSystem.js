/**
 * 선택지 + Decision Checkpoint
 * checkpoint:true 선택 후 재확인 오버레이, 수정해도 패널티 없음
 */
import choicesData from '../data/choices.json';

export class ChoiceSystem {
  constructor(stateManager) {
    this.state = stateManager;
  }

  getChoicesForStage(stageId) {
    const list = choicesData.choices ?? [];
    return list.filter((c) => c.stageId === stageId);
  }

  getChoiceById(id) {
    const list = choicesData.choices ?? [];
    return list.find((c) => c.id === id);
  }

  applyChoice(choiceId) {
    const choice = this.getChoiceById(choiceId);
    if (!choice) return null;
    const effects = choice.effects ?? {};
    const internalDelta = effects.internalChaos ?? 0;
    const externalDelta = effects.externalRisk ?? 0;
    const promiseRisk = effects.promiseRisk === true;
    return { choice, internalDelta, externalDelta, promiseRisk };
  }

  logChoice(choiceId, text) {
    const log = this.state.get('choiceLog') ?? [];
    log.push({ choiceId, text });
    this.state.set({ choiceLog: log });
  }
}
