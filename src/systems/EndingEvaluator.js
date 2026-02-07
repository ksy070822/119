/**
 * 엔딩 판정: S / A / B / C
 * S: confusionPeak ≤ 1 AND promiseRiskCount = 0 AND scopeClarityScore ≥ 2
 * A: confusionPeak ≤ 2 AND scopeClarityScore ≥ 1
 * B: confusionPeak ≤ 3 OR 단정 1회
 * C: 그 외
 */
import endingsData from '../data/endings.json';

export class EndingEvaluator {
  constructor(stateManager) {
    this.state = stateManager;
  }

  evaluate() {
    const confusionPeak = this.state.get('confusionPeak') ?? 0;
    const promiseRiskCount = this.state.get('promiseRiskCount') ?? 0;
    const scopeClarityScore = this.state.get('scopeClarityScore') ?? 0;

    if (confusionPeak <= 1 && promiseRiskCount === 0 && scopeClarityScore >= 2) return 'S';
    if (confusionPeak <= 2 && scopeClarityScore >= 1) return 'A';
    if (confusionPeak <= 3 || promiseRiskCount === 1) return 'B';
    return 'C';
  }

  getEndingText(grade) {
    const list = endingsData.endings ?? [];
    const e = list.find((x) => x.grade === grade);
    return e ?? { grade: 'C', title: '후속 개선 필요', message: '이번 경험을 바탕으로 조직 기준을 더 활용해 보세요.' };
  }
}
