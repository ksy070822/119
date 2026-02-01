/**
 * 스테이지 전환 이미지 및 배경 — public/assets (ASCII-only)
 * getVillageBg / getGuildBg from assetPaths.js
 */
import { getVillageBg, getGuildBg } from './assetPaths.js';

export const BACKGROUNDS = {
  /** 평화로운 마을 (인트로·엔딩) */
  peacefulVillage: getVillageBg(1),
  /** 마을 맵 초기 배경 */
  village: getVillageBg(1),
  /** 단계별 마을 전환 이미지 (스테이지 전환 시 표시) */
  villageByStage: {
    1: getVillageBg(1),
    2: getVillageBg(2),
    3: getVillageBg(3),
    4: getVillageBg(4),
    5: getVillageBg(5),
  },
  /** 실내(컨트롤센터) 기본 */
  indoorDefault: getGuildBg(1),
  /** 단계별 실내 (동료 상담 후 배경 전환) */
  indoorByStage: {
    1: getGuildBg(1),
    2: getGuildBg(2),
    3: getGuildBg(3),
    4: getGuildBg(4),
  },
};

export const STAGE_IMAGES = {
  peaceful: BACKGROUNDS.peacefulVillage,
  stage1: BACKGROUNDS.villageByStage[1],
  stage2: BACKGROUNDS.villageByStage[2],
  stage3: BACKGROUNDS.villageByStage[3],
  stage4: BACKGROUNDS.villageByStage[4],
  controlCenter: BACKGROUNDS.indoorDefault,
};

export const STAGE_NAMES = {
  1: '상황 파악',
  2: '원인 분석',
  3: '대응 조치',
  4: '복구 및 기록',
  5: '최종 해소',
};
