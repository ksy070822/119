/**
 * 반려동물 의료 데이터: 종별 진료과, 질환, 증상 태그, 추천 질문
 * 
 * 이 파일은 종별로 진료과, 대표 질환, 증상 태그, 그리고 태그별 추천 질문을 정의합니다.
 */

// 종 타입 정의
export const SPECIES = {
  DOG: 'dog',
  CAT: 'cat',
  RABBIT: 'rabbit',
  HAMSTER: 'hamster',
  BIRD: 'bird',
  HEDGEHOG: 'hedgehog',
  REPTILE: 'reptile'
};

// 진료과 타입 정의
export const DEPARTMENTS = {
  ORTHO: 'ortho',           // 정형외과
  DERM: 'derm',             // 피부과
  DIGESTIVE: 'digestive',   // 소화기과
  RESP: 'resp',             // 호흡기과
  URO: 'uro',               // 비뇨기과
  NEURO: 'neuro',           // 신경과
  BEHAVIOR: 'behavior',     // 행동
  INFECTIOUS: 'infectious', // 감염내과
  GENERAL: 'general',       // 일반
  ENV: 'env',               // 환경성(파충류)
  DENTAL: 'dental'          // 치과
};

// 종별 정보 (UI 표시용)
export const SPECIES_INFO = {
  [SPECIES.DOG]: {
    name: '강아지',
    icon: '🐶',
    color: '#FF9500',
    departments: [DEPARTMENTS.ORTHO, DEPARTMENTS.DERM, DEPARTMENTS.DIGESTIVE, DEPARTMENTS.RESP, DEPARTMENTS.INFECTIOUS]
  },
  [SPECIES.CAT]: {
    name: '고양이',
    icon: '🐱',
    color: '#AF52DE',
    departments: [DEPARTMENTS.INFECTIOUS, DEPARTMENTS.URO, DEPARTMENTS.DERM, DEPARTMENTS.BEHAVIOR, DEPARTMENTS.DIGESTIVE, DEPARTMENTS.RESP]
  },
  [SPECIES.RABBIT]: {
    name: '토끼',
    icon: '🐰',
    color: '#FFB6C1',
    departments: [DEPARTMENTS.DIGESTIVE, DEPARTMENTS.DENTAL, DEPARTMENTS.RESP, DEPARTMENTS.DERM, DEPARTMENTS.URO]
  },
  [SPECIES.HAMSTER]: {
    name: '햄스터',
    icon: '🐹',
    color: '#FFD700',
    departments: [DEPARTMENTS.DERM, DEPARTMENTS.RESP, DEPARTMENTS.DIGESTIVE, DEPARTMENTS.DENTAL]
  },
  [SPECIES.BIRD]: {
    name: '새',
    icon: '🐦',
    color: '#5AC8FA',
    departments: [DEPARTMENTS.RESP, DEPARTMENTS.DIGESTIVE, DEPARTMENTS.DERM, DEPARTMENTS.URO]
  },
  [SPECIES.HEDGEHOG]: {
    name: '고슴도치',
    icon: '🦔',
    color: '#8E8E93',
    departments: [DEPARTMENTS.DIGESTIVE, DEPARTMENTS.DERM, DEPARTMENTS.NEURO, DEPARTMENTS.RESP]
  },
  [SPECIES.REPTILE]: {
    name: '파충류',
    icon: '🦎',
    color: '#34C759',
    departments: [DEPARTMENTS.ENV, DEPARTMENTS.RESP, DEPARTMENTS.DIGESTIVE, DEPARTMENTS.DERM]
  }
};

// 진료과 정보 (UI 표시용)
export const DEPARTMENT_INFO = {
  [DEPARTMENTS.ORTHO]: { name: '정형외과', icon: '🦴', description: '뼈, 관절, 근육 문제' },
  [DEPARTMENTS.DERM]: { name: '피부과', icon: '🐾', description: '피부, 털, 알레르기' },
  [DEPARTMENTS.DIGESTIVE]: { name: '소화기과', icon: '🐟', description: '소화, 위장 문제' },
  [DEPARTMENTS.RESP]: { name: '호흡기과', icon: '🫁', description: '기침, 호흡 문제' },
  [DEPARTMENTS.URO]: { name: '비뇨기과', icon: '🩸', description: '소변, 생식기 문제' },
  [DEPARTMENTS.NEURO]: { name: '신경과', icon: '🧠', description: '신경계 문제' },
  [DEPARTMENTS.BEHAVIOR]: { name: '행동', icon: '😿', description: '행동 변화, 스트레스' },
  [DEPARTMENTS.INFECTIOUS]: { name: '감염내과', icon: '🧪', description: '감염, 바이러스' },
  [DEPARTMENTS.GENERAL]: { name: '일반', icon: '🏥', description: '기타 증상' },
  [DEPARTMENTS.ENV]: { name: '환경성', icon: '🌡️', description: '사육 환경 문제' },
  [DEPARTMENTS.DENTAL]: { name: '치과', icon: '🦷', description: '치아, 턱 문제' }
};

// 증상 태그 정의 (종별 + 진료과별)
export const SYMPTOM_TAGS = {
  // 정형외과
  limping: { id: 'limping', name: '다리를 절어요', dept: DEPARTMENTS.ORTHO, species: [SPECIES.DOG, SPECIES.CAT] },
  skip_walk: { id: 'skip_walk', name: '점프/계단 거부', dept: DEPARTMENTS.ORTHO, species: [SPECIES.DOG] },
  hind_leg_weakness: { id: 'hind_leg_weakness', name: '뒷다리가 후들거림', dept: DEPARTMENTS.ORTHO, species: [SPECIES.DOG] },
  sudden_sit: { id: 'sudden_sit', name: '갑자기 주저앉음', dept: DEPARTMENTS.ORTHO, species: [SPECIES.DOG] },
  
  // 피부과
  scratching: { id: 'scratching', name: '긁어요', dept: DEPARTMENTS.DERM, species: [SPECIES.DOG, SPECIES.CAT, SPECIES.RABBIT, SPECIES.HAMSTER] },
  red_swollen: { id: 'red_swollen', name: '붉게 부었어요', dept: DEPARTMENTS.DERM, species: [SPECIES.DOG, SPECIES.CAT] },
  hair_loss: { id: 'hair_loss', name: '털이 빠짐', dept: DEPARTMENTS.DERM, species: [SPECIES.DOG, SPECIES.CAT, SPECIES.HAMSTER, SPECIES.HEDGEHOG] },
  bad_smell: { id: 'bad_smell', name: '냄새가 나요', dept: DEPARTMENTS.DERM, species: [SPECIES.DOG, SPECIES.CAT] },
  dandruff: { id: 'dandruff', name: '비듬', dept: DEPARTMENTS.DERM, species: [SPECIES.HAMSTER, SPECIES.HEDGEHOG] },
  over_grooming: { id: 'over_grooming', name: '털을 뽑아요', dept: DEPARTMENTS.DERM, species: [SPECIES.CAT] },
  
  // 소화기과
  vomiting: { id: 'vomiting', name: '구토', dept: DEPARTMENTS.DIGESTIVE, species: [SPECIES.DOG, SPECIES.CAT, SPECIES.RABBIT, SPECIES.HAMSTER, SPECIES.REPTILE] },
  diarrhea: { id: 'diarrhea', name: '설사', dept: DEPARTMENTS.DIGESTIVE, species: [SPECIES.DOG, SPECIES.CAT, SPECIES.RABBIT, SPECIES.HAMSTER, SPECIES.HEDGEHOG, SPECIES.REPTILE] },
  loss_appetite: { id: 'loss_appetite', name: '밥을 안 먹어요', dept: DEPARTMENTS.DIGESTIVE, species: [SPECIES.DOG, SPECIES.CAT, SPECIES.RABBIT, SPECIES.HAMSTER, SPECIES.HEDGEHOG, SPECIES.REPTILE] },
  abdominal_pain: { id: 'abdominal_pain', name: '배를 만지면 싫어해요', dept: DEPARTMENTS.DIGESTIVE, species: [SPECIES.DOG, SPECIES.CAT, SPECIES.RABBIT, SPECIES.HAMSTER] },
  small_poop: { id: 'small_poop', name: '응가가 작아졌어요', dept: DEPARTMENTS.DIGESTIVE, species: [SPECIES.RABBIT] },
  drooling: { id: 'drooling', name: '침 흘림', dept: DEPARTMENTS.DIGESTIVE, species: [SPECIES.RABBIT, SPECIES.HAMSTER] },
  wet_anus: { id: 'wet_anus', name: '젖은 엉덩이', dept: DEPARTMENTS.DIGESTIVE, species: [SPECIES.HAMSTER] },
  no_poop: { id: 'no_poop', name: '변을 안 봄', dept: DEPARTMENTS.DIGESTIVE, species: [SPECIES.REPTILE] },
  
  // 호흡기과
  coughing: { id: 'coughing', name: '기침', dept: DEPARTMENTS.RESP, species: [SPECIES.DOG, SPECIES.CAT, SPECIES.RABBIT, SPECIES.HAMSTER, SPECIES.BIRD, SPECIES.HEDGEHOG, SPECIES.REPTILE] },
  runny_nose: { id: 'runny_nose', name: '콧물이 나요', dept: DEPARTMENTS.RESP, species: [SPECIES.DOG, SPECIES.CAT, SPECIES.RABBIT, SPECIES.HAMSTER, SPECIES.BIRD, SPECIES.REPTILE] },
  breathing_difficulty: { id: 'breathing_difficulty', name: '숨을 힘들게 쉬어요', dept: DEPARTMENTS.RESP, species: [SPECIES.DOG, SPECIES.CAT, SPECIES.RABBIT, SPECIES.HAMSTER, SPECIES.BIRD, SPECIES.HEDGEHOG, SPECIES.REPTILE] },
  sneezing: { id: 'sneezing', name: '재채기', dept: DEPARTMENTS.RESP, species: [SPECIES.CAT, SPECIES.RABBIT, SPECIES.BIRD] },
  eye_discharge: { id: 'eye_discharge', name: '눈물', dept: DEPARTMENTS.RESP, species: [SPECIES.CAT, SPECIES.RABBIT] },
  open_mouth_breathing: { id: 'open_mouth_breathing', name: '입을 벌리고 숨쉬기', dept: DEPARTMENTS.RESP, species: [SPECIES.REPTILE] },
  
  // 비뇨기과
  frequent_urination: { id: 'frequent_urination', name: '화장실만 가요', dept: DEPARTMENTS.URO, species: [SPECIES.CAT] },
  no_urine: { id: 'no_urine', name: '소변이 안 나와요', dept: DEPARTMENTS.URO, species: [SPECIES.CAT] },
  crying: { id: 'crying', name: '울어요', dept: DEPARTMENTS.URO, species: [SPECIES.CAT] },
  red_urine: { id: 'red_urine', name: '소변이 빨개요', dept: DEPARTMENTS.URO, species: [SPECIES.RABBIT] },
  swollen_abdomen: { id: 'swollen_abdomen', name: '배가 빵빵함', dept: DEPARTMENTS.URO, species: [SPECIES.BIRD] },
  straining: { id: 'straining', name: '힘줘서 앉아있음', dept: DEPARTMENTS.URO, species: [SPECIES.BIRD] },
  
  // 감염내과
  bloody_diarrhea: { id: 'bloody_diarrhea', name: '혈변', dept: DEPARTMENTS.INFECTIOUS, species: [SPECIES.DOG] },
  fever: { id: 'fever', name: '열이 있어요', dept: DEPARTMENTS.INFECTIOUS, species: [SPECIES.DOG, SPECIES.CAT] },
  severe_lethargy: { id: 'severe_lethargy', name: '심한 무기력', dept: DEPARTMENTS.INFECTIOUS, species: [SPECIES.DOG, SPECIES.CAT] },
  nasal_bleeding: { id: 'nasal_bleeding', name: '비출혈', dept: DEPARTMENTS.INFECTIOUS, species: [SPECIES.CAT] },
  
  // 행동
  aggression: { id: 'aggression', name: '갑자기 공격해요', dept: DEPARTMENTS.BEHAVIOR, species: [SPECIES.CAT] },
  hiding: { id: 'hiding', name: '숨어요', dept: DEPARTMENTS.BEHAVIOR, species: [SPECIES.CAT] },
  
  // 신경과
  wobbly_gait: { id: 'wobbly_gait', name: '뒤뚱거림', dept: DEPARTMENTS.NEURO, species: [SPECIES.HEDGEHOG] },
  
  // 치과
  jaw_problem: { id: 'jaw_problem', name: '턱을 잘 안 움직여요', dept: DEPARTMENTS.DENTAL, species: [SPECIES.RABBIT, SPECIES.HAMSTER] },
  cant_eat_hard: { id: 'cant_eat_hard', name: '딱딱한 걸 못 먹어요', dept: DEPARTMENTS.DENTAL, species: [SPECIES.RABBIT, SPECIES.HAMSTER] },
  
  // 환경성 (파충류)
  weak_limbs: { id: 'weak_limbs', name: '힘이 없음', dept: DEPARTMENTS.ENV, species: [SPECIES.REPTILE] },
  soft_jaw: { id: 'soft_jaw', name: '부드러운 턱/다리', dept: DEPARTMENTS.ENV, species: [SPECIES.REPTILE] },
  retained_shed: { id: 'retained_shed', name: '탈피가 안 떨어짐', dept: DEPARTMENTS.ENV, species: [SPECIES.REPTILE] },
  
  // 일반
  lethargy: { id: 'lethargy', name: '무기력', dept: DEPARTMENTS.GENERAL, species: [SPECIES.DOG, SPECIES.CAT, SPECIES.RABBIT, SPECIES.HAMSTER, SPECIES.BIRD, SPECIES.HEDGEHOG] },
  reduced_movement: { id: 'reduced_movement', name: '움직임이 줄었어요', dept: DEPARTMENTS.GENERAL, species: [SPECIES.RABBIT, SPECIES.HAMSTER, SPECIES.BIRD] }
};

// 태그별 추천 질문
export const FOLLOW_UP_QUESTIONS = {
  vomiting: [
    {
      id: 'vomiting_duration',
      question: '구토는 언제부터 시작됐나요?',
      placeholder: '예: 어제 저녁부터 3번 정도 토했어요'
    },
    {
      id: 'vomiting_appearance',
      question: '토한 내용물의 색이나 모양은 어땠나요?',
      placeholder: '예: 노란 물만 나왔어요 / 먹은 사료가 그대로 나왔어요'
    },
    {
      id: 'vomiting_frequency',
      question: '하루에 몇 번 정도 토하나요?',
      placeholder: '예: 하루에 2-3번 정도'
    }
  ],
  limping: [
    {
      id: 'limping_leg',
      question: '어느 쪽 다리를 절뚝거리는 것 같나요?',
      placeholder: '예: 오른쪽 뒷다리'
    },
    {
      id: 'limping_started',
      question: '언제부터 절뚝거리기 시작했나요?',
      placeholder: '예: 산책 중 갑자기'
    },
    {
      id: 'limping_severity',
      question: '절뚝거림이 심한가요?',
      placeholder: '예: 가끔 다리를 들고 걷기도 해요'
    }
  ],
  diarrhea: [
    {
      id: 'diarrhea_blood',
      question: '변에 피가 섞여 있나요?',
      placeholder: '예: 붉은색 피가 조금 묻어 있었어요'
    },
    {
      id: 'diarrhea_frequency',
      question: '하루에 몇 번 정도 설사를 하나요?',
      placeholder: '예: 하루에 5-6번 정도'
    },
    {
      id: 'diarrhea_color',
      question: '변의 색깔은 어떤가요?',
      placeholder: '예: 노란색 묽은 변'
    }
  ],
  loss_appetite: [
    {
      id: 'appetite_duration',
      question: '밥을 안 먹은 지 얼마나 되었나요?',
      placeholder: '예: 어제부터 밥을 전혀 안 먹어요'
    },
    {
      id: 'appetite_water',
      question: '물은 마시나요?',
      placeholder: '예: 물은 조금씩 마셔요'
    }
  ],
  coughing: [
    {
      id: 'coughing_type',
      question: '어떤 종류의 기침인가요?',
      placeholder: '예: 켁켁 소리 / 헛기침'
    },
    {
      id: 'coughing_when',
      question: '언제 기침을 하나요?',
      placeholder: '예: 운동 후 / 밤에'
    }
  ],
  no_urine: [
    {
      id: 'no_urine_duration',
      question: '소변이 안 나온 지 얼마나 되었나요?',
      placeholder: '예: 하루 종일 소변을 안 봤어요'
    },
    {
      id: 'no_urine_attempts',
      question: '화장실에는 가나요?',
      placeholder: '예: 화장실에는 가는데 소변은 안 나와요'
    }
  ],
  small_poop: [
    {
      id: 'small_poop_duration',
      question: '응가가 작아진 지 얼마나 되었나요?',
      placeholder: '예: 이틀 전부터'
    },
    {
      id: 'small_poop_appetite',
      question: '밥은 먹나요?',
      placeholder: '예: 밥은 거의 안 먹어요'
    }
  ],
  breathing_difficulty: [
    {
      id: 'breathing_difficulty_severity',
      question: '숨쉬기가 얼마나 힘들어 보이나요?',
      placeholder: '예: 배로 숨을 쉬고 있어요'
    },
    {
      id: 'breathing_difficulty_when',
      question: '언제 숨쉬기가 힘들어 보이나요?',
      placeholder: '예: 조금만 움직여도'
    }
  ],
  hair_loss: [
    {
      id: 'hair_loss_location',
      question: '털이 빠진 부위는 어디인가요?',
      placeholder: '예: 등 전체 / 배 쪽'
    },
    {
      id: 'hair_loss_pattern',
      question: '털이 빠지는 패턴은 어떤가요?',
      placeholder: '예: 동그랗게 빠져요 / 전체적으로 얇아졌어요'
    }
  ],
  scratching: [
    {
      id: 'scratching_location',
      question: '어디를 긁나요?',
      placeholder: '예: 귀 / 배 / 등'
    },
    {
      id: 'scratching_frequency',
      question: '얼마나 자주 긁나요?',
      placeholder: '예: 하루 종일 긁어요'
    }
  ]
};

// 종별 대표 질환 정보
export const CONDITIONS = {
  [SPECIES.DOG]: [
    {
      id: 'dog_patella_luxation',
      name_ko: '슬개골 탈구',
      dept: DEPARTMENTS.ORTHO,
      typical_symptoms: ['limping', 'skip_walk', 'hind_leg_weakness'],
      note: '소형견에서 매우 흔함'
    },
    {
      id: 'dog_gastroenteritis',
      name_ko: '급성 위장염',
      dept: DEPARTMENTS.DIGESTIVE,
      typical_symptoms: ['vomiting', 'diarrhea', 'loss_appetite']
    },
    {
      id: 'dog_parvovirus',
      name_ko: '파보바이러스 장염',
      dept: DEPARTMENTS.INFECTIOUS,
      typical_symptoms: ['bloody_diarrhea', 'vomiting', 'severe_lethargy'],
      note: '응급 가능성 높음(특히 어린 개)'
    },
    {
      id: 'dog_allergy',
      name_ko: '알레르기 피부염',
      dept: DEPARTMENTS.DERM,
      typical_symptoms: ['scratching', 'red_swollen', 'hair_loss']
    }
  ],
  [SPECIES.CAT]: [
    {
      id: 'cat_panleukopenia',
      name_ko: '범백(전염성 장염)',
      dept: DEPARTMENTS.INFECTIOUS,
      typical_symptoms: ['vomiting', 'diarrhea', 'fever', 'severe_lethargy'],
      note: '응급 가능성 높음'
    },
    {
      id: 'cat_flutd',
      name_ko: 'FLUTD (하부요로질환)',
      dept: DEPARTMENTS.URO,
      typical_symptoms: ['frequent_urination', 'crying', 'no_urine'],
      note: '요도폐색은 응급'
    },
    {
      id: 'cat_upper_respiratory',
      name_ko: '상부 호흡기 감염',
      dept: DEPARTMENTS.INFECTIOUS,
      typical_symptoms: ['runny_nose', 'sneezing', 'eye_discharge']
    }
  ],
  [SPECIES.RABBIT]: [
    {
      id: 'rabbit_gi_stasis',
      name_ko: '위장 정체(GI Stasis)',
      dept: DEPARTMENTS.DIGESTIVE,
      typical_symptoms: ['loss_appetite', 'small_poop', 'abdominal_pain', 'reduced_movement'],
      note: '토끼에서 매우 흔한 응급 질환'
    },
    {
      id: 'rabbit_malocclusion',
      name_ko: '부정교합',
      dept: DEPARTMENTS.DENTAL,
      typical_symptoms: ['jaw_problem', 'cant_eat_hard', 'drooling']
    },
    {
      id: 'rabbit_pasteurella',
      name_ko: '파스티렐라 감염(콧물병)',
      dept: DEPARTMENTS.RESP,
      typical_symptoms: ['runny_nose', 'sneezing', 'breathing_difficulty']
    }
  ],
  [SPECIES.HAMSTER]: [
    {
      id: 'hamster_wet_tail',
      name_ko: '웻테일(심한 설사)',
      dept: DEPARTMENTS.DIGESTIVE,
      typical_symptoms: ['diarrhea', 'wet_anus', 'lethargy']
    },
    {
      id: 'hamster_mite',
      name_ko: '진드기 감염',
      dept: DEPARTMENTS.DERM,
      typical_symptoms: ['hair_loss', 'scratching', 'dandruff']
    }
  ],
  [SPECIES.BIRD]: [
    {
      id: 'bird_egg_binding',
      name_ko: '난체 정체(Egg binding)',
      dept: DEPARTMENTS.URO,
      typical_symptoms: ['swollen_abdomen', 'straining', 'reduced_movement'],
      note: '응급 가능성 매우 높음'
    },
    {
      id: 'bird_aspergillosis',
      name_ko: '아스페르길루스증',
      dept: DEPARTMENTS.RESP,
      typical_symptoms: ['breathing_difficulty', 'runny_nose']
    }
  ],
  [SPECIES.HEDGEHOG]: [
    {
      id: 'hedgehog_wobbly_syndrome',
      name_ko: '휘청거리는 고슴도치 증후군',
      dept: DEPARTMENTS.NEURO,
      typical_symptoms: ['wobbly_gait', 'hind_leg_weakness']
    },
    {
      id: 'hedgehog_mite',
      name_ko: '진드기 감염',
      dept: DEPARTMENTS.DERM,
      typical_symptoms: ['hair_loss', 'scratching', 'dandruff']
    }
  ],
  [SPECIES.REPTILE]: [
    {
      id: 'reptile_mbd',
      name_ko: '대사성 뼈질환(MBD)',
      dept: DEPARTMENTS.ENV,
      typical_symptoms: ['weak_limbs', 'soft_jaw', 'loss_appetite'],
      note: '잘못된 사육 환경/칼슘 부족'
    },
    {
      id: 'reptile_respiratory',
      name_ko: '상부 호흡기 감염',
      dept: DEPARTMENTS.RESP,
      typical_symptoms: ['open_mouth_breathing', 'runny_nose', 'breathing_difficulty']
    }
  ]
};

// 종별로 사용 가능한 진료과 가져오기
export function getDepartmentsForSpecies(species) {
  return SPECIES_INFO[species]?.departments || [];
}

// 진료과별 증상 태그 가져오기
export function getSymptomTagsForDepartment(species, department) {
  return Object.values(SYMPTOM_TAGS).filter(
    tag => tag.dept === department && (tag.species.includes(species) || tag.species.length === 0)
  );
}

// 선택된 태그들에 대한 추천 질문 가져오기
export function getFollowUpQuestions(selectedTagIds) {
  const questions = [];
  const questionMap = new Map();
  
  selectedTagIds.forEach(tagId => {
    const tagQuestions = FOLLOW_UP_QUESTIONS[tagId] || [];
    tagQuestions.forEach(q => {
      if (!questionMap.has(q.id)) {
        questionMap.set(q.id, q);
        questions.push(q);
      }
    });
  });
  
  return questions;
}

// 종별 대표 질환 가져오기
export function getConditionsForSpecies(species) {
  return CONDITIONS[species] || [];
}

