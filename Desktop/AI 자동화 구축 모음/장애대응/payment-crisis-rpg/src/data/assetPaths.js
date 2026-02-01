/**
 * Central asset paths under public/assets (ASCII-only).
 * Character IDs: communicator, techLeader, techCommunicator, controlTower, reporter.
 * Folder names: communicator, tech_leader, tech_communicator, control_tower, reporter.
 * BASE_URL ensures correct paths in dev and production build.
 */
const BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL
  ? import.meta.env.BASE_URL.replace(/\/$/, '')
  : '';
const A = `${BASE}/assets`;

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

/** 캐릭터 포즈: idle, walk_up, walk_down, walk_left, walk_right — 없으면 idle 폴백 */
const WALK_POSE_FILES = {
  idle: 'idle.png',
  walk_up: 'walk_up.png',
  walk_down: 'walk_down.png',
  walk_left: 'walk_left.png',
  walk_right: 'walk_right.png',
};

export function getCharacterSpriteUrl(charId, pose) {
  const dir = getCharacterAssetDir(charId);
  const file = WALK_POSE_FILES[pose] || WALK_POSE_FILES.idle;
  return `${dir}/${file}`;
}

/** stageLevel 1–5: 1=green, 2=yellow, 3=orange, 4=red, 5=recovering */
const VILLAGE_STAGE_NAMES = {
  1: 'stage_1_green',
  2: 'stage_2_yellow',
  3: 'stage_3_orange',
  4: 'stage_4_red',
  5: 'stage_5_recovering',
};

export function getVillageBg(stageLevel = 1) {
  const name = VILLAGE_STAGE_NAMES[Math.min(5, Math.max(1, stageLevel))] || 'stage_1_green';
  return `${A}/maps/village/${name}.png`;
}

/** stageLevel 1–4 for guild */
const GUILD_STAGE_NAMES = {
  1: 'stage_1_green',
  2: 'stage_2_yellow',
  3: 'stage_3_orange',
  4: 'stage_4_red',
};

export function getGuildBg(stageLevel = 1) {
  const name = GUILD_STAGE_NAMES[Math.min(4, Math.max(1, stageLevel))] || 'stage_1_green';
  return `${A}/maps/guild/${name}.png`;
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

const ITEM_BASE_NAMES = {
  communicator: 'base_scroll',
  tech_leader: 'base_tablet',
  tech_communicator: 'base_orb',
  control_tower: 'base_map',
  reporter: 'base_clock',
};

export function getItemImage(charId, slotIndex) {
  const folder = CHAR_ID_TO_FOLDER[charId] || charId;
  if (slotIndex === 0) {
    const base = ITEM_BASE_NAMES[folder] || 'base_scroll';
    return `${A}/items/${folder}/${base}.png`;
  }
  return `${A}/items/${folder}/sub${Math.min(4, slotIndex)}.png`;
}

/** 타이틀 화면 메인 이미지 — public/assets/ui/title.png */
export const TITLE_IMAGE = `${A}/ui/title.png`;

/** 테크리더 move 폴더 내 GLB (public/assets/characters/tech_leader/move/*.glb) — 추후 3D 렌더 시 사용, 현재는 PNG 스프라이트 사용 */
export function getTechLeaderMoveGlbPath(filename = 'character.glb') {
  return `${A}/characters/tech_leader/move/${filename}`;
}
