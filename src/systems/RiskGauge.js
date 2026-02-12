/**
 * 2축 리스크 게이지
 * 조직 혼란도: 안정(0~19) / 경미(20~39) / 병목(40~59) / 혼선(60~79) / 과부하(80~100)
 * 대외 위험도: 낮음 / 주의 / 부담 / 위험 / 임계
 * 숫자 직접 표시 금지, 상태 텍스트만
 */
const CHAOS_LABELS = ['안정', '경미', '병목', '혼선', '과부하'];
const EXTERNAL_LABELS = ['낮음', '주의', '부담', '위험', '임계'];

function tier(v, max = 100) {
  const n = Math.max(0, Math.min(max, Math.round(v)));
  const step = max / 5;
  const index = Math.min(4, Math.floor(n / step));
  return index;
}

export class RiskGauge {
  constructor(stateManager) {
    this.state = stateManager;
  }

  getChaosLabel(value) {
    return CHAOS_LABELS[tier(value)] ?? CHAOS_LABELS[0];
  }

  getExternalLabel(value) {
    return EXTERNAL_LABELS[tier(value)] ?? EXTERNAL_LABELS[0];
  }

  getChaosTier(value) {
    return tier(value);
  }

  getExternalTier(value) {
    return tier(value);
  }

  applyDelta(internalDelta = 0, externalDelta = 0, promiseRisk = false) {
    const chaos = this.state.get('internalChaos') ?? 0;
    const ext = this.state.get('externalRisk') ?? 0;
    const confusionPeak = this.state.get('confusionPeak') ?? 0;
    const promiseRiskCount = this.state.get('promiseRiskCount') ?? 0;

    const newChaos = Math.max(0, Math.min(100, chaos + internalDelta));
    const newExt = Math.max(0, Math.min(100, ext + externalDelta));
    const newConfusionPeak = Math.max(confusionPeak, tier(newChaos));
    const newPromiseCount = promiseRisk ? promiseRiskCount + 1 : promiseRiskCount;

    this.state.set({
      internalChaos: newChaos,
      externalRisk: newExt,
      confusionPeak: newConfusionPeak,
      promiseRiskCount: newPromiseCount,
    });

    return {
      internalChaos: newChaos,
      externalRisk: newExt,
      chaosTier: tier(newChaos),
      externalTier: tier(newExt),
    };
  }
}
