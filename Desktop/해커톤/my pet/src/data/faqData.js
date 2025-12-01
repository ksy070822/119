// FAQ 더미 데이터 - 보호자가 자주 묻는 질문과 답변
// species_code, department_code, symptom_tag로 검색 가능

export const faqData = [
  // === 강아지 - 피부과 ===
  {
    species_code: "dog",
    species_label_ko: "강아지",
    department_code: "dermatology",
    department_label_ko: "피부과",
    symptom_tag: "itching",
    symptom_label_ko: "가려움",
    question_ko: "우리 강아지가 몸을 계속 긁는데 알레르기일까요?",
    answer_ko: "강아지가 몸을 자주 긁는다면 알레르기, 피부염, 기생충 감염 등이 원인일 수 있어요. 긁는 부위가 붉거나 털이 빠지면 1~2일 내로 병원 진료를 권장합니다.",
    keywords: ["긁다", "가려워", "알레르기", "피부"]
  },
  {
    species_code: "dog",
    species_label_ko: "강아지",
    department_code: "dermatology",
    department_label_ko: "피부과",
    symptom_tag: "hair_loss",
    symptom_label_ko: "탈모",
    question_ko: "강아지 털이 한 부분에서 뭉텅 빠지는데 괜찮은 건가요?",
    answer_ko: "국소적인 탈모는 세균성 피부염, 곰팡이, 호르몬 문제 등 다양한 원인이 있을 수 있어요. 탈모 부위가 넓어지거나 딱지가 생기면 검사를 받아보는 것이 좋아요.",
    keywords: ["털", "빠지", "탈모", "대머리"]
  },
  {
    species_code: "dog",
    species_label_ko: "강아지",
    department_code: "dermatology",
    department_label_ko: "피부과",
    symptom_tag: "bump",
    symptom_label_ko: "혹/덩어리",
    question_ko: "강아지 몸에 혹이 생겼어요. 암인가요?",
    answer_ko: "혹이 모두 암은 아니에요. 지방종, 낭종, 양성 종양인 경우가 많습니다. 하지만 빠르게 커지거나, 딱딱하거나, 피부색이 변하면 조직검사를 권장드려요.",
    keywords: ["혹", "덩어리", "종양", "암"]
  },

  // === 강아지 - 내과 ===
  {
    species_code: "dog",
    species_label_ko: "강아지",
    department_code: "internal_medicine",
    department_label_ko: "내과",
    symptom_tag: "vomiting",
    symptom_label_ko: "구토",
    question_ko: "강아지가 오늘 몇 번을 계속 토했어요. 위험한가요?",
    answer_ko: "하루에 여러 번 반복해서 토하면 탈수나 위장 질환 위험이 있어요. 밥이나 물을 전혀 못 먹거나 피가 섞여 나오면 즉시 병원에 가시는 게 안전합니다.",
    keywords: ["토하다", "구토", "구역질", "게우다"]
  },
  {
    species_code: "dog",
    species_label_ko: "강아지",
    department_code: "internal_medicine",
    department_label_ko: "내과",
    symptom_tag: "diarrhea",
    symptom_label_ko: "설사",
    question_ko: "강아지가 물 설사를 해요. 집에서 지켜봐도 될까요?",
    answer_ko: "묽은 설사가 하루 이틀 정도만 지속되고 식욕과 활력이 괜찮다면 일시적인 장염일 수 있어요. 하지만 2일 이상 지속되거나 피, 점액이 보이면 내원 검진이 필요합니다.",
    keywords: ["설사", "묽은 변", "물변", "장염"]
  },
  {
    species_code: "dog",
    species_label_ko: "강아지",
    department_code: "internal_medicine",
    department_label_ko: "내과",
    symptom_tag: "no_appetite",
    symptom_label_ko: "식욕부진",
    question_ko: "강아지가 밥을 안 먹어요. 며칠째 거의 안 먹어요.",
    answer_ko: "1~2일 정도 식욕이 없을 수 있지만, 3일 이상 거의 먹지 않으면 내장 질환이나 다른 문제가 있을 수 있어요. 물도 안 마시면 빨리 병원에 가세요.",
    keywords: ["밥", "안 먹", "식욕", "거부"]
  },

  // === 강아지 - 안과 ===
  {
    species_code: "dog",
    species_label_ko: "강아지",
    department_code: "ophthalmology",
    department_label_ko: "안과",
    symptom_tag: "eye_discharge",
    symptom_label_ko: "눈곱/분비물",
    question_ko: "눈곱이 자주 끼고 눈물이 계속 나는데 괜찮을까요?",
    answer_ko: "투명한 눈물이 조금 나는 정도는 환경 변화일 수 있지만, 노란색이나 초록색 분비물이 나오면 결막염이나 각막 질환 가능성이 있어요. 하루 이상 지속되면 진료를 권장합니다.",
    keywords: ["눈", "눈곱", "눈물", "분비물"]
  },
  {
    species_code: "dog",
    species_label_ko: "강아지",
    department_code: "ophthalmology",
    department_label_ko: "안과",
    symptom_tag: "red_eye",
    symptom_label_ko: "충혈",
    question_ko: "강아지 눈이 빨개요. 많이 아픈 건가요?",
    answer_ko: "눈 충혈은 결막염, 각막 손상, 녹내장 등 여러 원인이 있어요. 눈을 자주 비비거나 눈을 잘 못 뜨면 빨리 진료받는 게 좋습니다.",
    keywords: ["빨간 눈", "충혈", "눈 빨개"]
  },

  // === 강아지 - 정형외과 ===
  {
    species_code: "dog",
    species_label_ko: "강아지",
    department_code: "orthopedics",
    department_label_ko: "정형외과",
    symptom_tag: "limping",
    symptom_label_ko: "절뚝거림",
    question_ko: "강아지가 갑자기 다리를 절어요. 어디 다친 걸까요?",
    answer_ko: "갑자기 절뚝거리면 외상, 탈구, 관절 문제 등이 원인일 수 있어요. 다리를 전혀 디디지 못하거나 많이 부어있으면 빨리 병원에서 검사받으세요.",
    keywords: ["절뚝", "다리", "걷기", "절다"]
  },

  // === 고양이 - 비뇨기과 ===
  {
    species_code: "cat",
    species_label_ko: "고양이",
    department_code: "urology",
    department_label_ko: "비뇨기과",
    symptom_tag: "urination_issue",
    symptom_label_ko: "배뇨 문제",
    question_ko: "고양이가 화장실에 자주 가는데 소변을 거의 못 봐요.",
    answer_ko: "이 증상은 방광염이나 요로 폐색일 수 있어요. 특히 수컷 고양이의 경우 요로 폐색은 응급 상황이에요. 24시간 내로 병원에 가시는 게 좋습니다.",
    keywords: ["소변", "오줌", "화장실", "배뇨"]
  },
  {
    species_code: "cat",
    species_label_ko: "고양이",
    department_code: "urology",
    department_label_ko: "비뇨기과",
    symptom_tag: "blood_in_urine",
    symptom_label_ko: "혈뇨",
    question_ko: "고양이 소변에 피가 섞여 나와요. 응급인가요?",
    answer_ko: "혈뇨는 방광염, 요로결석, 종양 등의 신호일 수 있어요. 소변을 아예 못 보거나 계속 힘을 주면 응급이에요. 가능하면 당일 진료를 권장합니다.",
    keywords: ["피", "혈뇨", "빨간 소변"]
  },

  // === 고양이 - 내과 ===
  {
    species_code: "cat",
    species_label_ko: "고양이",
    department_code: "internal_medicine",
    department_label_ko: "내과",
    symptom_tag: "vomiting",
    symptom_label_ko: "구토",
    question_ko: "고양이가 자주 토해요. 헤어볼인가요?",
    answer_ko: "가끔 토하는 건 헤어볼일 수 있지만, 일주일에 여러 번 토하거나 음식을 먹자마자 토하면 위장 질환이나 다른 문제일 수 있어요. 빈번한 구토는 검사가 필요해요.",
    keywords: ["토하다", "구토", "헤어볼"]
  },
  {
    species_code: "cat",
    species_label_ko: "고양이",
    department_code: "internal_medicine",
    department_label_ko: "내과",
    symptom_tag: "weight_loss",
    symptom_label_ko: "체중 감소",
    question_ko: "고양이가 잘 먹는데 살이 빠져요. 왜 그럴까요?",
    answer_ko: "식욕은 좋은데 체중이 줄면 갑상선 기능 항진증, 당뇨, 소화 흡수 장애 등이 원인일 수 있어요. 혈액검사로 원인을 확인하는 게 좋습니다.",
    keywords: ["살", "체중", "마르다", "빠지다"]
  },

  // === 고양이 - 피부과 ===
  {
    species_code: "cat",
    species_label_ko: "고양이",
    department_code: "dermatology",
    department_label_ko: "피부과",
    symptom_tag: "over_grooming",
    symptom_label_ko: "과도한 그루밍",
    question_ko: "고양이가 한 부분만 계속 핥아서 털이 다 빠졌어요.",
    answer_ko: "과도한 그루밍은 스트레스, 알레르기, 피부 질환 등이 원인일 수 있어요. 핥는 부위 피부가 빨개지거나 상처가 나면 진료가 필요합니다.",
    keywords: ["핥다", "그루밍", "털 빠짐"]
  },

  // === 공통 - 예방접종/건강검진 ===
  {
    species_code: "all",
    species_label_ko: "모든 반려동물",
    department_code: "preventive",
    department_label_ko: "예방의학",
    symptom_tag: "vaccination",
    symptom_label_ko: "예방접종",
    question_ko: "예방접종은 언제 해야 하나요?",
    answer_ko: "강아지와 고양이 모두 생후 6~8주부터 기본 접종을 시작해요. 이후 매년 추가 접종이 필요합니다. 정확한 일정은 수의사 선생님과 상담하세요.",
    keywords: ["예방접종", "백신", "접종"]
  },
  {
    species_code: "all",
    species_label_ko: "모든 반려동물",
    department_code: "preventive",
    department_label_ko: "예방의학",
    symptom_tag: "checkup",
    symptom_label_ko: "건강검진",
    question_ko: "건강검진은 얼마나 자주 받아야 하나요?",
    answer_ko: "7세 이하는 연 1회, 7세 이상 노령견/묘는 연 2회 건강검진을 권장해요. 정기 검진으로 질병을 조기에 발견할 수 있습니다.",
    keywords: ["건강검진", "검진", "검사"]
  }
];

/**
 * FAQ 데이터에서 질문에 맞는 답변 검색
 * @param {string} question - 사용자 질문
 * @param {string} species - 반려동물 종류 ('dog', 'cat', 'all')
 * @param {string} diagnosis - 현재 진단명 (선택)
 * @returns {Array} 관련 FAQ 목록
 */
export function searchFAQ(question, species = 'all', diagnosis = '') {
  const questionLower = question.toLowerCase();
  const questionWords = questionLower.split(/\s+/);

  return faqData
    .filter(faq => {
      // 종 필터링 (all은 모든 종에 해당)
      const speciesMatch = faq.species_code === 'all' || faq.species_code === species;
      if (!speciesMatch) return false;

      // 키워드 매칭
      const keywordMatch = faq.keywords.some(keyword =>
        questionLower.includes(keyword.toLowerCase())
      );

      // 질문 유사도 체크
      const questionMatch = faq.question_ko.split(/\s+/).some(word =>
        questionWords.some(qWord => word.includes(qWord) || qWord.includes(word))
      );

      return keywordMatch || questionMatch;
    })
    .sort((a, b) => {
      // 더 많은 키워드가 매칭되는 순서로 정렬
      const aMatches = a.keywords.filter(k => questionLower.includes(k.toLowerCase())).length;
      const bMatches = b.keywords.filter(k => questionLower.includes(k.toLowerCase())).length;
      return bMatches - aMatches;
    })
    .slice(0, 3); // 상위 3개만 반환
}

/**
 * FAQ 답변을 포함한 종합 응답 생성용 컨텍스트
 * @param {string} question - 사용자 질문
 * @param {string} species - 반려동물 종류
 * @returns {string} AI 프롬프트에 추가할 FAQ 컨텍스트
 */
export function getFAQContext(question, species = 'dog') {
  const relatedFAQs = searchFAQ(question, species);

  if (relatedFAQs.length === 0) {
    return '';
  }

  let context = '\n\n[참고할 FAQ 데이터]\n';
  relatedFAQs.forEach((faq, idx) => {
    context += `\n${idx + 1}. Q: ${faq.question_ko}\n   A: ${faq.answer_ko}\n`;
  });

  return context;
}

export default faqData;
