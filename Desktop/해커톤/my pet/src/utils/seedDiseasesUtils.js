/**
 * Firestore 질병 마스터 데이터 시드 유틸리티
 * 브라우저에서 실행 가능한 버전
 */

import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { CONDITIONS, SYMPTOM_TAGS, FOLLOW_UP_QUESTIONS, SPECIES } from '../data/petMedicalData';

// 연령/성별/긴급도 매핑 데이터 (seedDiseases.js에서 가져옴)
const DISEASE_METADATA = {
  dog_patella_luxation: {
    ageMinMonths: 6, ageMaxMonths: 120, sex: "any", neuteredRelevant: false,
    severity: "medium", emergencyLevel: "clinic_24h",
    shortDescription: "슬개골이 제 위치에서 벗어나 다리를 절게 되는 질환",
    riskFactors: ["소형견", "선천적 체형 이상"],
    homeCare: ["점프, 계단 오르내리기를 제한하고 미끄러운 바닥을 피합니다."],
    shouldGoHospitalWhen: ["계속 다리를 들고 있거나 보행이 힘들어 보일 때", "통증이 심해 만지면 심하게 싫어할 때"]
  },
  dog_gastroenteritis: {
    ageMinMonths: 2, ageMaxMonths: 180, sex: "any", neuteredRelevant: false,
    severity: "medium", emergencyLevel: "clinic_24h",
    shortDescription: "구토와 설사를 동반하는 급성 위장 질환",
    riskFactors: ["갑작스러운 사료 변경", "상한 음식 섭취"],
    homeCare: ["물은 조금씩 자주 제공하고, 6~12시간 금식 후 소량의 사료로 시작합니다."],
    shouldGoHospitalWhen: ["구토와 설사가 24시간 이상 지속될 때", "기력이 크게 떨어지거나 잇몸이 창백해 보일 때"]
  },
  dog_parvovirus: {
    ageMinMonths: 0, ageMaxMonths: 24, sex: "any", neuteredRelevant: false,
    severity: "high", emergencyLevel: "er_possible",
    shortDescription: "심한 설사와 구토를 일으키는 전염성 바이러스성 장염",
    riskFactors: ["예방접종을 완료하지 않은 어린 강아지", "다른 개들과 접촉이 많음"],
    homeCare: ["즉시 병원 방문 전까지 물과 음식을 강제로 먹이지 않습니다."],
    shouldGoHospitalWhen: ["혈변이 계속 나오거나 기력이 급격히 떨어질 때", "구토와 설사가 12시간 이상 지속될 때"]
  },
  dog_allergy: {
    ageMinMonths: 3, ageMaxMonths: 180, sex: "any", neuteredRelevant: false,
    severity: "low", emergencyLevel: "home",
    shortDescription: "알레르기 원인으로 인한 피부 염증 및 가려움",
    riskFactors: ["알레르기 체질", "야외활동 많음"],
    homeCare: ["목욕 자주 금지, 약용 샴푸 사용", "알레르기 원인 물질 접촉 최소화"],
    shouldGoHospitalWhen: ["심한 긁기로 피부가 상처가 날 때", "2주 이상 지속될 때"]
  },
  cat_panleukopenia: {
    ageMinMonths: 0, ageMaxMonths: 12, sex: "any", neuteredRelevant: false,
    severity: "high", emergencyLevel: "er_possible",
    shortDescription: "고양이 전염성 장염으로 심한 구토와 설사를 일으키는 바이러스 질환",
    riskFactors: ["예방접종 미완료", "다른 고양이와 접촉"],
    homeCare: ["즉시 병원 방문이 필요합니다. 집에서 지체하지 마세요."],
    shouldGoHospitalWhen: ["구토와 설사가 지속될 때", "기력이 급격히 떨어질 때"]
  },
  cat_flutd: {
    ageMinMonths: 6, ageMaxMonths: 180, sex: "male", neuteredRelevant: true,
    severity: "high", emergencyLevel: "er_now",
    shortDescription: "요도 폐색으로 소변이 막힐 수 있는 응급 질환",
    riskFactors: ["비만", "운동량 부족", "스트레스가 많은 환경"],
    homeCare: ["소변이 아예 안 나오면 집에서 지체하지 말고 바로 병원으로 이동해야 합니다."],
    shouldGoHospitalWhen: ["화장실에 자주 가는데 소변이 거의 나오지 않을 때", "울거나 배를 만질 때 심한 통증을 보일 때"]
  },
  cat_upper_respiratory: {
    ageMinMonths: 0, ageMaxMonths: 240, sex: "any", neuteredRelevant: false,
    severity: "low", emergencyLevel: "home",
    shortDescription: "재채기와 콧물, 눈물을 동반하는 감기 유사 질환",
    riskFactors: ["보호소 출신", "다른 고양이와의 접촉"],
    homeCare: ["따뜻하고 조용한 환경을 유지하고, 식욕이 떨어지면 향이 강한 캔 사료를 제공합니다."],
    shouldGoHospitalWhen: ["호흡이 가빠지거나 입을 벌리고 숨을 쉴 때", "이틀 이상 밥과 물을 거의 먹지 않을 때"]
  },
  rabbit_gi_stasis: {
    ageMinMonths: 3, ageMaxMonths: 120, sex: "any", neuteredRelevant: false,
    severity: "high", emergencyLevel: "er_possible",
    shortDescription: "장 운동이 멈춰 생명을 위협할 수 있는 응급 질환",
    riskFactors: ["건초 섭취 부족", "스트레스", "갑작스러운 사료 변경"],
    homeCare: ["건초를 항상 충분히 제공하고, 먹지 않으면 지체 없이 병원에 내원해야 합니다."],
    shouldGoHospitalWhen: ["12시간 이상 아무것도 먹지 않을 때", "배가 단단해 보이거나 매우 처져 있을 때"]
  },
  rabbit_malocclusion: {
    ageMinMonths: 3, ageMaxMonths: 120, sex: "any", neuteredRelevant: false,
    severity: "medium", emergencyLevel: "clinic_24h",
    shortDescription: "이빨이 제대로 맞지 않아 먹이를 씹기 어려워지는 질환",
    riskFactors: ["선천적 이상", "부적절한 사료"],
    homeCare: ["부드러운 사료로 전환하고, 즉시 병원에서 이빨 교정이 필요합니다."],
    shouldGoHospitalWhen: ["밥을 전혀 먹지 못할 때", "침이 계속 흐를 때"]
  },
  rabbit_pasteurella: {
    ageMinMonths: 0, ageMaxMonths: 120, sex: "any", neuteredRelevant: false,
    severity: "medium", emergencyLevel: "clinic_24h",
    shortDescription: "콧물과 재채기를 동반하는 호흡기 감염",
    riskFactors: ["다른 토끼와 접촉", "환경 스트레스"],
    homeCare: ["따뜻하고 깨끗한 환경 유지, 즉시 병원 방문 권장"],
    shouldGoHospitalWhen: ["호흡이 힘들어 보일 때", "콧물이 계속 나올 때"]
  },
  hamster_wet_tail: {
    ageMinMonths: 1, ageMaxMonths: 12, sex: "any", neuteredRelevant: false,
    severity: "high", emergencyLevel: "er_possible",
    shortDescription: "어린 햄스터에서 흔한 심한 설사 질환으로 탈수 위험이 큼",
    riskFactors: ["환경 변화 스트레스", "위생 상태 불량"],
    homeCare: ["케이지를 조용하고 따뜻하게 유지하고, 바로 병원에 가는 것이 좋습니다."],
    shouldGoHospitalWhen: ["엉덩이가 계속 젖어 있고 냄새가 심할 때", "움직임이 거의 없고 눈이 반쯤 감겨 있을 때"]
  },
  hamster_mite: {
    ageMinMonths: 0, ageMaxMonths: 36, sex: "any", neuteredRelevant: false,
    severity: "low", emergencyLevel: "clinic_24h",
    shortDescription: "진드기에 의한 피부 감염으로 가려움과 탈모를 일으킴",
    riskFactors: ["위생 상태 불량", "다른 햄스터와 접촉"],
    homeCare: ["케이지 청소를 철저히 하고, 병원에서 진드기 치료제 처방이 필요합니다."],
    shouldGoHospitalWhen: ["탈모가 심하거나 피부에 상처가 생길 때"]
  },
  bird_egg_binding: {
    ageMinMonths: 6, ageMaxMonths: 120, sex: "female", neuteredRelevant: false,
    severity: "high", emergencyLevel: "er_now",
    shortDescription: "난소/난관에 알이 걸려 나오지 못하는 매우 위급한 상태",
    riskFactors: ["칼슘 부족", "지속적인 산란", "비만"],
    homeCare: ["집에서 강제로 만지거나 짜내려 하지 말고, 따뜻한 환경에서 안정시키며 즉시 병원으로 이동해야 합니다."],
    shouldGoHospitalWhen: ["배가 단단하고 숨쉬기가 힘들어 보일 때", "앉아만 있고 거의 움직이지 않을 때"]
  },
  bird_aspergillosis: {
    ageMinMonths: 0, ageMaxMonths: 240, sex: "any", neuteredRelevant: false,
    severity: "high", emergencyLevel: "clinic_24h",
    shortDescription: "곰팡이 감염으로 인한 호흡기 질환",
    riskFactors: ["습도 높은 환경", "먼지 많은 환경"],
    homeCare: ["환경을 깨끗하고 건조하게 유지하고, 즉시 병원 방문이 필요합니다."],
    shouldGoHospitalWhen: ["호흡이 힘들어 보이거나 입을 벌리고 숨쉴 때"]
  },
  hedgehog_wobbly_syndrome: {
    ageMinMonths: 12, ageMaxMonths: 60, sex: "any", neuteredRelevant: false,
    severity: "high", emergencyLevel: "clinic_24h",
    shortDescription: "신경계 질환으로 인한 보행 장애",
    riskFactors: ["유전적 요인", "영양 부족"],
    homeCare: ["안전한 환경을 유지하고, 즉시 병원 방문이 필요합니다."],
    shouldGoHospitalWhen: ["보행이 불가능할 정도로 심할 때"]
  },
  hedgehog_mite: {
    ageMinMonths: 0, ageMaxMonths: 72, sex: "any", neuteredRelevant: false,
    severity: "low", emergencyLevel: "clinic_24h",
    shortDescription: "진드기에 의한 피부 감염",
    riskFactors: ["위생 상태 불량"],
    homeCare: ["환경을 깨끗하게 유지하고, 병원에서 치료가 필요합니다."],
    shouldGoHospitalWhen: ["탈모가 심하거나 피부에 상처가 생길 때"]
  },
  reptile_mbd: {
    ageMinMonths: 3, ageMaxMonths: 240, sex: "any", neuteredRelevant: false,
    severity: "high", emergencyLevel: "clinic_24h",
    shortDescription: "칼슘과 자외선 부족으로 뼈가 약해지는 질환",
    riskFactors: ["UVB 조명 부족", "칼슘 보충제 미사용"],
    homeCare: ["즉시 UVB 조명을 점검하고, 칼슘제를 제공하되 반드시 병원 진료를 받는 것이 좋습니다."],
    shouldGoHospitalWhen: ["다리를 잘 못 쓰거나 턱이 매우 부드럽게 느껴질 때", "식욕이 거의 없고 움직이지 않을 때"]
  },
  reptile_respiratory: {
    ageMinMonths: 0, ageMaxMonths: 240, sex: "any", neuteredRelevant: false,
    severity: "medium", emergencyLevel: "clinic_24h",
    shortDescription: "호흡기 감염으로 입을 벌리고 숨쉬는 증상",
    riskFactors: ["온도/습도 부적절", "환경 스트레스"],
    homeCare: ["온도와 습도를 적절하게 유지하고, 즉시 병원 방문이 필요합니다."],
    shouldGoHospitalWhen: ["입을 벌리고 숨쉬거나 호흡이 힘들어 보일 때"]
  }
};

function getSpeciesGroup(species) {
  if (species === SPECIES.HEDGEHOG || species === SPECIES.REPTILE) {
    return 'other';
  }
  return species;
}

export async function seedDiseaseProfiles(force = false) {
  const diseasesCol = collection(db, "diseaseProfiles");
  
  if (!force) {
    const existingQuery = query(diseasesCol);
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      throw new Error(`기존 데이터 ${existingDocs.size}개 발견. 건너뜁니다.`);
    }
  }
  
  let count = 0;
  
  for (const [species, conditions] of Object.entries(CONDITIONS)) {
    const speciesGroup = getSpeciesGroup(species);
    
    for (const condition of conditions) {
      const metadata = DISEASE_METADATA[condition.id] || {
        ageMinMonths: 0, ageMaxMonths: 240, sex: "any", neuteredRelevant: false,
        severity: "medium", emergencyLevel: "clinic_24h",
        shortDescription: condition.note || "질병 정보",
        riskFactors: [], homeCare: [], shouldGoHospitalWhen: []
      };
      
      const diseaseDoc = {
        speciesGroup,
        conditionId: condition.id,
        nameKo: condition.name_ko,
        department: condition.dept,
        ageMinMonths: metadata.ageMinMonths,
        ageMaxMonths: metadata.ageMaxMonths,
        sex: metadata.sex,
        neuteredRelevant: metadata.neuteredRelevant,
        symptomTags: condition.typical_symptoms || [],
        severity: metadata.severity,
        emergencyLevel: metadata.emergencyLevel,
        shortDescription: metadata.shortDescription,
        riskFactors: metadata.riskFactors,
        homeCare: metadata.homeCare,
        shouldGoHospitalWhen: metadata.shouldGoHospitalWhen,
        createdAt: new Date()
      };
      
      await addDoc(diseasesCol, diseaseDoc);
      count++;
    }
  }
  
  return count;
}

export async function seedSymptomTags(force = false) {
  const tagsCol = collection(db, "symptomTags");
  
  if (!force) {
    const existingQuery = query(tagsCol);
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      throw new Error(`기존 데이터 ${existingDocs.size}개 발견. 건너뜁니다.`);
    }
  }
  
  let count = 0;
  
  for (const [tagId, tag] of Object.entries(SYMPTOM_TAGS)) {
    const speciesGroups = tag.species.map(s => getSpeciesGroup(s));
    
    const tagDoc = {
      tagId: tag.id,
      nameKo: tag.name,
      dept: tag.dept,
      speciesGroups: [...new Set(speciesGroups)],
      createdAt: new Date()
    };
    
    await addDoc(tagsCol, tagDoc);
    count++;
  }
  
  return count;
}

export async function seedFollowUpQuestions(force = false) {
  const questionsCol = collection(db, "followUpQuestions");
  
  if (!force) {
    const existingQuery = query(questionsCol);
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      throw new Error(`기존 데이터 ${existingDocs.size}개 발견. 건너뜁니다.`);
    }
  }
  
  let count = 0;
  
  for (const [tagId, questions] of Object.entries(FOLLOW_UP_QUESTIONS)) {
    const questionDoc = {
      tagId,
      questions: questions,
      createdAt: new Date()
    };
    
    await addDoc(questionsCol, questionDoc);
    count++;
  }
  
  return count;
}

export async function seedAll(force = false) {
  const results = {
    diseases: 0,
    tags: 0,
    questions: 0,
    errors: []
  };
  
  try {
    results.diseases = await seedDiseaseProfiles(force);
  } catch (error) {
    if (error.message.includes('기존 데이터')) {
      // 기존 데이터가 있는 경우 - 정상적인 상황
      const match = error.message.match(/(\d+)개/);
      if (match) {
        results.diseases = parseInt(match[1]);
      }
    } else {
      results.errors.push(`질병 프로필: ${error.message}`);
      throw error; // 예상치 못한 에러는 다시 throw
    }
  }
  
  try {
    results.tags = await seedSymptomTags(force);
  } catch (error) {
    if (error.message.includes('기존 데이터')) {
      const match = error.message.match(/(\d+)개/);
      if (match) {
        results.tags = parseInt(match[1]);
      }
    } else {
      results.errors.push(`증상 태그: ${error.message}`);
      throw error;
    }
  }
  
  try {
    results.questions = await seedFollowUpQuestions(force);
  } catch (error) {
    if (error.message.includes('기존 데이터')) {
      const match = error.message.match(/(\d+)개/);
      if (match) {
        results.questions = parseInt(match[1]);
      }
    } else {
      results.errors.push(`추천 질문: ${error.message}`);
      throw error;
    }
  }
  
  return results;
}

