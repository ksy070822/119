/**
 * Central asset paths under public/assets.
 * Character IDs: communicator, techLeader, techCommunicator, controlTower, reporter.
 * Folder names: communicator, tech_leader, tech_communicator, control_tower, reporter.
 * 기본 이미지: idle.png (서 있는 모습)
 * 배포(base path) 시 BASE가 비면 런타임에 location에서 보정 (GitHub Pages /119/ 등)
 */
function getBase() {
  let base = '';
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
    base = (import.meta.env.BASE_URL || '').replace(/\/$/, '');
  }
  if (!base && typeof window !== 'undefined' && window.location) {
    const path = window.location.pathname || '';
    if (path.startsWith('/119')) base = '/119';
  }
  return base;
}
const BASE = getBase();
const A = `${BASE}/assets`;
const IMG = `${BASE}/image`;

// 영문 ID → 영문 폴더명 매핑
const CHAR_ID_TO_FOLDER = {
  communicator: 'communicator',
  techLeader: 'tech_leader',
  techCommunicator: 'tech_communicator',
  controlTower: 'control_tower',
  reporter: 'reporter',
};

export function getCharacterAssetDir(id) {
  const folder = CHAR_ID_TO_FOLDER[id] || id;
  return `${A}/characters/${folder}`;
}

/** 캐릭터 메인 이미지 (idle.png - 서 있는 모습). 리포터는 walk_left를 좌우반전해 사용(마법 효과 없는 깔끔한 연출) */
export function getCharacterMainImage(charId) {
  const folder = CHAR_ID_TO_FOLDER[charId];
  if (!folder) return null;
  const file = charId === 'reporter' ? 'walk_left.png' : 'idle.png';
  return `${A}/characters/${folder}/${file}`;
}

/** 엔딩 후 '수고하셨습니다.' 클릭 시 재생 — 캐릭터별 마술/액션 동영상
 *  public/assets/characters/action_move/{communicator|tech_leader|...}_skill.mp4 */
export function getCharacterActionMovie(charId) {
  const folder = CHAR_ID_TO_FOLDER[charId];
  if (!folder) return null;
  return `${A}/characters/action_move/${folder}_skill.mp4`;
}

/** 캐릭터 포즈별 스프라이트 URL */
export function getCharacterSpriteUrl(charId, pose) {
  const dir = getCharacterAssetDir(charId);
  const poseFiles = {
    idle: 'idle.png',
    portrait: 'portrait.png',
    walk_up: 'walk_up.png',
    walk_down: 'walk_down.png',
    walk_left: 'walk_left.png',
    walk_right: 'walk_right.png',
  };
  const file = poseFiles[pose] || 'idle.png';
  return `${dir}/${file}`;
}

/** stageLevel 1–5: 배경 이미지 (public/assets/maps/village/) */
const VILLAGE_BG_FILES = {
  1: 'stage_1_green.png',
  2: 'stage_2_green_chaos_fading.png',
  3: 'stage_3_yellow.png',
  4: 'stage_4_orange.png',
  5: 'stage_5_red.png',
};

export function getVillageBg(stageLevel = 1) {
  const file = VILLAGE_BG_FILES[Math.min(5, Math.max(1, stageLevel))] || 'stage_1_green.png';
  return `${A}/maps/village/${file}`;
}

/** stageLevel 1–5 for guild (public/assets/maps/guild/)
 *  S2=옐로우 실내(초기공지), S3=레드, S4=옐로우, S5 후속조치=stage_1_green_alt */
const GUILD_BG_FILES = {
  1: 'stage_1_green.png',
  2: 'stage_2_yellow.png',   // 초기공지단계 — 옐로우 실내 배경
  3: 'stage_4_red.png',      // 심화공지판단
  4: 'stage_2_yellow.png',   // 복구판단
  5: 'stage_1_green_alt.png', // 후속조치
};

export function getGuildBg(stageLevel = 1) {
  const key = Math.min(5, Math.max(1, stageLevel));
  const file = GUILD_BG_FILES[key];
  if (file === 'yellowgreen') return 'gradient:yellowgreen';
  return `${A}/maps/guild/${file || 'stage_1_green.png'}`;
}

/** riskLevel 0–3: idle, angry, weakened, defeated */
const BOSS_SPRITES = ['idle', 'angry', 'weakened', 'defeated'];

export function getBossSprite(riskLevel = 0) {
  const idx = Math.min(3, Math.max(0, Math.floor(riskLevel)));
  return `${A}/characters/boss/${BOSS_SPRITES[idx]}.png`;
}

/** Compute risk level 0–3 from state (internalChaos + externalRisk). */
export function getRiskLevel(state) {
  const chaos = state?.internalChaos ?? 0;
  const ext = state?.externalRisk ?? 0;
  const avg = (chaos + ext) / 2;
  return Math.min(3, Math.floor(avg / 25));
}

/** Compute stage level 1–5 from currentAllyIndex (0→1, 1→2, … 4→5 recovering). */
export function getStageLevelFromAllyIndex(currentAllyIndex) {
  return Math.min(5, Math.max(1, currentAllyIndex + 1));
}

// 영문 ID → 영문 폴더명 (items용)
const CHAR_ID_TO_ITEM_FOLDER = {
  communicator: 'communicator',
  techLeader: 'tech_leader',
  techCommunicator: 'tech_communicator',
  controlTower: 'control_tower',
  reporter: 'reporter',
};

const ITEM_BASE_NAMES = {
  communicator: 'base_scroll',
  tech_leader: 'base_tablet',
  tech_communicator: 'base_orb',
  control_tower: 'base_map',
  reporter: 'base_clock',
};

export function getItemImage(charId, slotIndex) {
  const folder = CHAR_ID_TO_ITEM_FOLDER[charId] || charId;
  if (slotIndex === 0) {
    const base = ITEM_BASE_NAMES[folder] || 'base_scroll';
    return `${A}/items/${folder}/${base}.png`;
  }
  return `${A}/items/${folder}/sub${Math.min(4, slotIndex)}.png`;
}

/** 타이틀 화면 메인 이미지 — public/assets/ui/title.png */
export const TITLE_IMAGE = `${A}/ui/title.png`;

/** 보스전 직전 마법 시전 영상 — public/assets/magic/magic.mp4 (약 1분 30초) */
export function getMagicVideoUrl() {
  return `${A}/magic/magic.mp4`;
}

/** 연출 에셋 — public/assets/effects/ */
export const CLOUD_OVERLAY = `${A}/effects/cloud_overlay.png`;
export const MAGIC_CIRCLE = `${A}/effects/magic_circle.png`;
export const PARTICLE_SPARK = `${A}/effects/particle_spark.png`;

/**
 * 관장자 에셋 — public/assets/characters/guardians/
 * - {id}_idle.png : 전신 서 있는 이미지 (맵/화면 NPC용 — 반드시 전신샷)
 * - {id}_portrait.png : 상반신 초상화 (대화창 하단용만 사용)
 * 화면에서는 전신(idle), 대화창에서는 상반신(portrait)만 사용.
 */
const GUARDIAN_ID_MAP = {
  CCO: 'cco',
  대외협력: 'external_affairs',
  PR: 'pr',
  CTO: 'cto',
  법무: 'external_affairs',  // 후속조치(S5) 관장자 — external_affairs idle/portrait 사용
};

/** idle이 없으면 portrait를 fallback으로 사용 (CCO 등) */
const GUARDIAN_IDLE_FALLBACK = {};

export function getGuardianIdle(guardianName) {
  const id = GUARDIAN_ID_MAP[guardianName];
  if (!id) return null;
  const fallback = GUARDIAN_IDLE_FALLBACK[id];
  if (fallback) return `${A}/characters/guardians/${fallback}`;
  return `${A}/characters/guardians/${id}_idle.png`;
}

export function getGuardianPortrait(guardianName) {
  const id = GUARDIAN_ID_MAP[guardianName];
  if (!id) return null;
  return `${A}/characters/guardians/${id}_portrait.png`;
}

/** 테크리더 move 폴더 내 GLB (public/assets/characters/tech_leader/move/*.glb) — 추후 3D 렌더 시 사용, 현재는 PNG 스프라이트 사용 */
export function getTechLeaderMoveGlbPath(filename = 'character.glb') {
  return `${A}/characters/tech_leader/move/${filename}`;
}

/** BGM — 파일 4개: peace, tension, crisis, ending (public/assets/music/) */
export const BGM_FILES = {
  peace: 'bgm_peace.mp3',       // 타이틀, 인트로
  tension: 'bgm_tension.mp3',   // 영웅 등장 ~ S2
  crisis: 'bgm_crisis.mp3',     // S3 심화공지 ~ S4 복구
  ending: 'bgm_ending.mp3',     // S5, 보스, 엔딩
  // 아래는 위 4개 파일로 매핑 (파일 없음)
  recovery: 'bgm_crisis.mp3',   // crisis와 동일
  boss: 'bgm_ending.mp3',       // ending과 동일
};
export function getBGMUrl(key) {
  const file = BGM_FILES[key];
  return file ? `${A}/music/${file}` : null;
}
