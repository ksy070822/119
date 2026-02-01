/**
 * 직업(캐릭터) 데이터. imagePath = portrait.png, itemImagePath = items/{캐릭터}/ (public/assets)
 */
import { getItemImage } from './assetPaths.js';
import { CHARACTERS } from './characters.js';

function buildRoles() {
  const ids = ['communicator', 'techLeader', 'techCommunicator', 'controlTower', 'reporter'];
  const roleMeta = [
    { id: 'communicator', name: '커뮤니케이터', role: '공지·고객 전파', icon: '📜', item: '공지 스크롤' },
    { id: 'techLeader', name: '테크리더', role: '기술 복구', icon: '⚙️', item: '복구 태블릿' },
    { id: 'techCommunicator', name: '테크커뮤니케이터', role: '기술→고객 언어', icon: '🔍', item: '번역 수정구' },
    { id: 'controlTower', name: '컨트롤타워', role: '의사결정·계약', icon: '🧭', item: '계약 지도' },
    { id: 'reporter', name: '리포터', role: '타임라인·기준', icon: '🕰️', item: '황금 시계' },
  ];
  const roles = roleMeta.map((r) => {
    const char = CHARACTERS[r.id];
    const imagePath = char?.sprites?.portrait ?? null;
    const itemImagePath = r.id ? getItemImage(r.id, 0) : null;
    return { ...r, imagePath, itemImagePath };
  });
  roles.push({ id: 'bizLead', name: '비즈니스리더', role: '사업·보상', icon: '💼', item: '결정 인장', imagePath: null, itemImagePath: null });
  return roles;
}

export const ROLES = buildRoles();

/** 동료 NPC 마을 내 위치 (left%, top%) */
export const ALLY_POSITIONS = [
  { left: 18, top: 28 },
  { left: 72, top: 25 },
  { left: 48, top: 58 },
  { left: 22, top: 72 },
  { left: 75, top: 68 },
];
