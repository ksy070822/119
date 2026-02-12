/**
 * ParticlePresets — 이펙트별 파티클 설정.
 * 각 프리셋: color, count, speed, radius, duration, alpha, gravity(선택), spread(선택)
 */
export const ParticlePresets = {
  // 기본 프리셋
  DANGER_SPARK: { color: 0xff4444, count: 20, speed: 2, radius: 2, duration: 600 },
  CALM_GLOW: { color: 0x44aaff, count: 10, speed: 0.5, radius: 3, duration: 800 },
  STAGE_DUST: { color: 0xffffff, count: 12, speed: 0.8, radius: 1.5, duration: 1000, alpha: 0.4 },

  // 보스전 프리셋
  BOSS_APPEAR: {
    color: 0xff0000,
    count: 30,
    speed: 3,
    radius: 3,
    duration: 1000,
    alpha: 0.8,
    gravity: 0.02,
  },
  HERO_GLOW: {
    color: 0xffd700,
    count: 15,
    speed: 0.8,
    radius: 4,
    duration: 1200,
    alpha: 0.7,
  },
  ITEM_FUSION: {
    color: 0xffe500,
    count: 25,
    speed: 1.5,
    radius: 2.5,
    duration: 800,
    alpha: 0.9,
    spread: Math.PI * 2,
  },
  VICTORY_BURST: {
    color: 0xffd700,
    count: 50,
    speed: 4,
    radius: 3.5,
    duration: 1500,
    alpha: 1.0,
    gravity: -0.03,
  },
  SKILL_CAST: {
    color: 0x88ccff,
    count: 20,
    speed: 2.5,
    radius: 2,
    duration: 700,
    alpha: 0.85,
  },

  // 위험도 관련
  RISK_WARNING: {
    color: 0xff6600,
    count: 8,
    speed: 1,
    radius: 2,
    duration: 500,
    alpha: 0.6,
  },
  HEAL_GLOW: {
    color: 0x2ecc71,
    count: 12,
    speed: 0.6,
    radius: 3,
    duration: 900,
    alpha: 0.5,
    gravity: -0.02,
  },
};
