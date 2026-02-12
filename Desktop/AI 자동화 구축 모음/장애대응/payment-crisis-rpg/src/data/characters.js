/**
 * 캐릭터 데이터 (v3) — 5직업, 인트로 순서, 동료 상담 순서
 * 스프라이트/초상화 경로는 public/assets/characters/ 폴더 사용
 * 기본 이미지: idle.png (서 있는 모습)
 */
import { getCharacterAssetDir } from './assetPaths.js';

function buildSprites(charId) {
  const dir = getCharacterAssetDir(charId);
  // walk_left가 없는 캐릭터는 walk_right를 좌측 이동 시 반전하여 사용
  // reporter는 walk_right에 마법 효과가 있어 walk_left를 쓰고, 오른쪽 이동 시 좌우반전
  const useRightForBoth = ['communicator', 'techLeader'].includes(charId);
  const useLeftForBoth = charId === 'reporter';
  const hasWalkLeft = !useRightForBoth && !useLeftForBoth;
  const walkUpFile = charId === 'controlTower' ? 'idle.png' : 'walk_up.png';
  const walkLeftUrl = useLeftForBoth ? `${dir}/walk_left.png` : (hasWalkLeft ? `${dir}/walk_left.png` : `${dir}/walk_right.png`);
  const walkRightUrl = useLeftForBoth ? `${dir}/walk_left.png` : `${dir}/walk_right.png`;
  return {
    idle: `${dir}/idle.png`,
    portrait: `${dir}/portrait.png`,
    walkUp: `${dir}/${walkUpFile}`,
    walkDown: `${dir}/idle.png`,  // walk_down 없음 → idle 사용
    walkLeft: walkLeftUrl,
    walkRight: walkRightUrl,
  };
}

export const CHARACTERS = {
  communicator: {
    id: 'communicator',
    name: '커뮤니케이터',
    class: '바드',
    gender: 'female',
    age: '20대 중반',
    description: '말과 글로 혼란을 잠재우는 영웅',
    mainItem: '황금 스크롤',
    color: '#FFD700',
    introLine: '큰일이에요. 시민들의 문의가 증가하고 있어요.',
    sprites: buildSprites('communicator'),
  },
  techLeader: {
    id: 'techLeader',
    name: '테크리더',
    class: '팔라딘',
    gender: 'male',
    age: '30대 후반',
    description: '장애를 직접 격파하는 기술 전사',
    mainItem: '복구의 태블릿',
    color: '#4A90A4',
    introLine: '원인을 분석해봐야겠어요.',
    sprites: buildSprites('techLeader'),
  },
  techCommunicator: {
    id: 'techCommunicator',
    name: '테크커뮤니케이터',
    class: '마법사',
    gender: 'male',
    age: '40대',
    description: '기술 언어를 마을 주민 언어로 번역하는 마법사',
    mainItem: '번역의 수정구',
    color: '#2ECC71',
    introLine: '함께 원인을 분석해보고 제가 시민들을 안심시킬 수 있게 도와드릴게요.',
    sprites: buildSprites('techCommunicator'),
  },
  controlTower: {
    id: 'controlTower',
    name: '컨트롤타워',
    class: '전략가',
    gender: 'male',
    age: '30대 초반',
    description: '전체 상황을 지휘하는 전략가',
    mainItem: '계약의 지도',
    color: '#8E44AD',
    introLine: '다른 도시 시민들도 불안해하지 않게 필요한 조치를 준비해야겠어요.',
    sprites: buildSprites('controlTower'),
  },
  reporter: {
    id: 'reporter',
    name: '리포터',
    class: '현자',
    gender: 'female',
    age: '50대',
    description: '시간과 기록을 다루는 현자',
    mainItem: '황금 시계',
    color: '#D68910',
    introLine: '제가 상황을 살펴보고 올게요.',
    sprites: buildSprites('reporter'),
  },
};

export const INTRO_ORDER = [
  'communicator',
  'techLeader',
  'techCommunicator',
  'controlTower',
  'reporter',
];

export const ALLY_ORDER = {
  communicator: ['techLeader', 'techCommunicator', 'controlTower', 'reporter'],
  techLeader: ['communicator', 'techCommunicator', 'controlTower', 'reporter'],
  techCommunicator: ['communicator', 'techLeader', 'controlTower', 'reporter'],
  controlTower: ['communicator', 'techLeader', 'techCommunicator', 'reporter'],
  reporter: ['communicator', 'techLeader', 'techCommunicator', 'controlTower'],
};
