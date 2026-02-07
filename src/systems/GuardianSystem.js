/**
 * 관장자: 플레이어가 '조언 요청' 클릭 시에만 등장. 답 대신 판단 기준·리스크만 설명
 */
import guardiansData from '../data/guardians.json';

export class GuardianSystem {
  constructor(stateManager) {
    this.state = stateManager;
  }

  getGuardians() {
    return guardiansData.guardians ?? [];
  }

  canShowGuardian(stage, internalChaos, externalRisk, sameStageWeakCount) {
    if (internalChaos >= 40) return true;
    if (externalRisk >= 60) return true;
    if (sameStageWeakCount >= 2) return true;
    return false;
  }

  markShownThisStage() {
    this.state.set({ guardianShownThisStage: true });
  }

  resetStageGuardian() {
    this.state.set({ guardianShownThisStage: false });
  }
}
