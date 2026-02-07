/**
 * 5단계 스테이지 진행
 * Stage 1: 장애 인지 (0~10분) / 2: 초기 공지 (10~40) / 3: 심화 공지 (40~130) / 4: 복구 (130~200) / 5: 후속 조치
 */
import stagesData from '../data/stages.json';

const STAGE_NAMES = ['', '장애 인지', '초기 공지 판단', '심화 공지 판단', '복구 판단', '후속 조치'];

export class StageManager {
  constructor(stateManager) {
    this.state = stateManager;
  }

  getStageName(stageNum) {
    return STAGE_NAMES[stageNum] ?? '';
  }

  getCurrentStage() {
    const elapsed = this.state.get('elapsedMinutes') ?? 0;
    if (elapsed < 10) return 1;
    if (elapsed < 40) return 2;
    if (elapsed < 130) return 3;
    if (elapsed < 200) return 4;
    return 5;
  }

  getStagesConfig() {
    return stagesData.stages ?? [];
  }

  advanceTime(minutes = 1) {
    const current = this.state.get('elapsedMinutes') + minutes;
    this.state.set({ elapsedMinutes: current });
    const stage = this.getCurrentStage();
    if (stage !== this.state.get('stage')) {
      this.state.set({ stage });
    }
    return stage;
  }

  /** 맵의 비관장자 NPC 전원 대화 완료 시 true */
  checkStageComplete(npcs) {
    if (!npcs?.length) return false;
    const required = npcs.filter((n) => !n.isGuardian);
    if (required.length === 0) return true;
    return required.every((n) => n.hasSpoken);
  }
}
