/**
 * 직업별 대화 데이터 (fromJob_to_toJob)
 * 모든 선택은 진행 가능, 리스크만 변화.
 */
export const DIALOGUES = {
  communicator_to_techLeader: {
    stage: 1,
    steps: [
      { type: 'dialogue', text: '지금 시스템 상태가 어떤가요? 시민들에게 뭐라고 안내해야 할지 모르겠어요.' },
      { type: 'dialogue', text: '지금 원인을 파악 중이에요. 결제 시스템 쪽에서 문제가 발생한 것 같은데, 정확한 복구 시간은 아직 몰라요.' },
      {
        type: 'choice',
        choices: [
          { id: 'c1_1', text: '"확인 중"이라고만 안내할게요', preview: '조직 혼란 ▼ / 대외 위험 유지', checkpoint: true, effects: { internalChaos: -10, externalRisk: 0 }, response: '좋아요. 정확한 정보가 나오면 바로 알려드릴게요.' },
          { id: 'c1_2', text: '"곧 복구됩니다"라고 안내할게요', preview: '조직 혼란 ▼▼ / 대외 위험 ▲', checkpoint: true, effects: { internalChaos: -20, externalRisk: 15, promiseRisk: true }, response: '음... 아직 복구 시간을 장담하기 어려운데, 시민들에게 약속이 되어버릴 수 있어요.' },
          { id: 'c1_3', text: '일단 아무 말 하지 않을게요', preview: '조직 혼란 ▲ / 대외 위험 유지', checkpoint: false, effects: { internalChaos: 15, externalRisk: 0 }, response: '알겠어요. 그런데 현장에서는 뭐라고 대응해야 할지 혼란스러울 수 있어요.' },
        ],
      },
    ],
    itemReward: 'system_report',
  },
  techLeader_to_communicator: {
    stage: 1,
    steps: [
      { type: 'dialogue', text: '지금 시민들 반응이 어때요? 제가 복구에 집중해야 하는데, 상황 파악이 필요해요.' },
      { type: 'dialogue', text: '문의가 급증하고 있어요. "언제 되냐"는 질문이 대부분이에요. 예상 시간을 알 수 있을까요?' },
      {
        type: 'choice',
        choices: [
          { id: 't1_1', text: '"30분 내 복구 목표"로 전달해주세요', preview: '시민 안심 / 압박감 ▲', checkpoint: true, effects: { internalChaos: -5, externalRisk: 10 }, response: '알겠어요. 30분이라고 안내할게요. 정말 가능한 거죠?' },
          { id: 't1_2', text: '"확인 중, 최대한 빨리"로만 전달해주세요', preview: '압박감 유지 / 시민 불안 유지', checkpoint: false, effects: { internalChaos: 0, externalRisk: 5 }, response: '네, 그렇게 안내할게요. 진행되면 바로 알려주세요.' },
        ],
      },
    ],
    itemReward: 'customer_voice',
  },
  communicator_to_techCommunicator: {
    stage: 2,
    steps: [
      { type: 'dialogue', text: '기술 용어를 시민들이 이해하기 쉽게 바꿔주실 수 있나요?' },
      { type: 'dialogue', text: '네. "장애", "복구 중" 같은 표현을 "점검 중", "곧 이용 가능" 정도로 바꿔서 공지할게요.' },
      {
        type: 'choice',
        choices: [
          { id: 'c2_1', text: '그렇게 공지할게요', preview: '대외 위험 ▼', checkpoint: false, effects: { internalChaos: 0, externalRisk: -10 }, response: '좋아요. 필요하면 더 조정해 드릴게요.' },
          { id: 'c2_2', text: '일단 현재 표현 유지할게요', preview: '유지', checkpoint: false, effects: { internalChaos: 0, externalRisk: 0 }, response: '알겠어요. 바꾸고 싶을 때 말씀해 주세요.' },
        ],
      },
    ],
    itemReward: 'translation_glossary',
  },
  communicator_to_controlTower: {
    stage: 3,
    steps: [
      { type: 'dialogue', text: '다른 도시 공지도 같이 올려야 할까요?' },
      { type: 'dialogue', text: '네. 영향 받는 구간만 짚어서 공지하면 시민들이 덜 불안해할 거예요.' },
      {
        type: 'choice',
        choices: [
          { id: 'c3_1', text: '영향 구간만 공지할게요', preview: '대외 위험 ▼', checkpoint: false, effects: { internalChaos: -5, externalRisk: -10 }, response: '좋아요.' },
          { id: 'c3_2', text: '전체 공지로 갈게요', preview: '조직 혼란 ▼', checkpoint: false, effects: { internalChaos: -10, externalRisk: 0 }, response: '괜찮아요. 일관되게 전달되면 돼요.' },
        ],
      },
    ],
    itemReward: 'scope_map',
  },
  communicator_to_reporter: {
    stage: 4,
    steps: [
      { type: 'dialogue', text: '타임라인 기록은 어떻게 남기면 될까요?' },
      { type: 'dialogue', text: '발생·감지·공지·조치·복구 시점만 순서대로 적어두시면 나중에 정리할 때 도움이 돼요.' },
      {
        type: 'choice',
        choices: [
          { id: 'c4_1', text: '그렇게 기록할게요', preview: '혼란 ▼', checkpoint: false, effects: { internalChaos: -10, externalRisk: 0 }, response: '좋아요.' },
          { id: 'c4_2', text: '간단 요약만 할게요', preview: '유지', checkpoint: false, effects: { internalChaos: 0, externalRisk: 0 }, response: '알겠어요. 나중에 보강해도 돼요.' },
        ],
      },
    ],
    itemReward: 'timeline_template',
  },
  techLeader_to_techCommunicator: {
    stage: 2,
    steps: [
      { type: 'dialogue', text: '고객 문의 답변용으로 기술 요약 부탁해요.' },
      { type: 'dialogue', text: '원인·영향 범위·예상 복구 시간을 한 문단으로 정리해 드릴게요.' },
      {
        type: 'choice',
        choices: [
          { id: 'tl2_1', text: '그걸로 공지 톤 맞출게요', preview: '대외 ▼', checkpoint: false, effects: { internalChaos: 0, externalRisk: -10 }, response: '좋아요.' },
          { id: 'tl2_2', text: '추가로 Q&A도 부탁해요', preview: '조직 ▼', checkpoint: false, effects: { internalChaos: -5, externalRisk: -5 }, response: '알겠어요.' },
        ],
      },
    ],
    itemReward: 'tech_summary',
  },
  techLeader_to_controlTower: {
    stage: 3,
    steps: [
      { type: 'dialogue', text: '계약/슬로우 쪽 조치 필요할까요?' },
      { type: 'dialogue', text: '영향 받는 서비스만 짚어서 조치하면 돼요. 범위 넓히지 마세요.' },
      {
        type: 'choice',
        choices: [
          { id: 'tl3_1', text: '최소 범위로 조치할게요', preview: '대외 ▼', checkpoint: false, effects: { internalChaos: 0, externalRisk: -10 }, response: '좋아요.' },
          { id: 'tl3_2', text: '전체 점검으로 갈게요', preview: '조직 ▲', checkpoint: false, effects: { internalChaos: 10, externalRisk: 0 }, response: '괜찮아요. 필요하면 조정하죠.' },
        ],
      },
    ],
    itemReward: 'contract_scope',
  },
  techLeader_to_reporter: {
    stage: 4,
    steps: [
      { type: 'dialogue', text: '기술 타임라인 기록 부탁해요.' },
      { type: 'dialogue', text: '이벤트 시점만 적어두시면 제가 정리할게요.' },
      {
        type: 'choice',
        choices: [
          { id: 'tl4_1', text: '시점만 전달할게요', preview: '유지', checkpoint: false, effects: { internalChaos: 0, externalRisk: 0 }, response: '좋아요.' },
          { id: 'tl4_2', text: '원인 추정도 같이 적을게요', preview: '혼란 ▼', checkpoint: false, effects: { internalChaos: -5, externalRisk: 0 }, response: '도움 돼요.' },
        ],
      },
    ],
    itemReward: 'event_log',
  },
  techCommunicator_to_communicator: {
    stage: 1,
    steps: [
      { type: 'dialogue', text: '공지 문구 같이 다듬을까요?' },
      { type: 'dialogue', text: '네. 시민들이 이해하기 쉬운 표현으로 바꿔볼게요.' },
      {
        type: 'choice',
        choices: [
          { id: 'tc1_1', text: '함께 다듬을게요', preview: '대외 ▼', checkpoint: false, effects: { internalChaos: -5, externalRisk: -10 }, response: '좋아요.' },
          { id: 'tc1_2', text: '제가 초안만 드릴게요', preview: '유지', checkpoint: false, effects: { internalChaos: 0, externalRisk: 0 }, response: '알겠어요.' },
        ],
      },
    ],
    itemReward: 'notice_draft',
  },
  techCommunicator_to_techLeader: {
    stage: 2,
    steps: [
      { type: 'dialogue', text: '원인 파악 결과 요약해 주실 수 있나요?' },
      { type: 'dialogue', text: '네. 영향 범위랑 예상 복구 시간 정리해 드릴게요.' },
      {
        type: 'choice',
        choices: [
          { id: 'tc2_1', text: '그걸로 고객 답변 준비할게요', preview: '대외 ▼', checkpoint: false, effects: { internalChaos: 0, externalRisk: -10 }, response: '좋아요.' },
          { id: 'tc2_2', text: '추가로 기술 용어 설명도 부탁해요', preview: '조직 ▼', checkpoint: false, effects: { internalChaos: -5, externalRisk: 0 }, response: '알겠어요.' },
        ],
      },
    ],
    itemReward: 'cause_summary',
  },
  techCommunicator_to_controlTower: {
    stage: 3,
    steps: [
      { type: 'dialogue', text: '계약 측에 전달할 메시지 정리해 드릴까요?' },
      { type: 'dialogue', text: '영향 구간과 조치 내용만 간단히요.' },
      {
        type: 'choice',
        choices: [
          { id: 'tc3_1', text: '그렇게 정리할게요', preview: '대외 ▼', checkpoint: false, effects: { internalChaos: 0, externalRisk: -5 }, response: '좋아요.' },
          { id: 'tc3_2', text: '기술 상세도 포함할게요', preview: '조직 ▼', checkpoint: false, effects: { internalChaos: -5, externalRisk: 0 }, response: '괜찮아요.' },
        ],
      },
    ],
    itemReward: 'contract_message',
  },
  techCommunicator_to_reporter: {
    stage: 4,
    steps: [
      { type: 'dialogue', text: '타임라인에 넣을 기술 이벤트 정리해 드릴까요?' },
      { type: 'dialogue', text: '네. 시점과 내용만 짧게 적어주시면 돼요.' },
      {
        type: 'choice',
        choices: [
          { id: 'tc4_1', text: '시점·내용만 전달할게요', preview: '유지', checkpoint: false, effects: { internalChaos: 0, externalRisk: 0 }, response: '좋아요.' },
          { id: 'tc4_2', text: '원인 추정도 같이 적을게요', preview: '혼란 ▼', checkpoint: false, effects: { internalChaos: -5, externalRisk: 0 }, response: '도움 돼요.' },
        ],
      },
    ],
    itemReward: 'tech_timeline',
  },
  controlTower_to_communicator: {
    stage: 1,
    steps: [
      { type: 'dialogue', text: '공지 톤과 범위 통일해 주실 수 있나요?' },
      { type: 'dialogue', text: '네. 영향 받는 구간만 짚어서 일관되게 안내할게요.' },
      {
        type: 'choice',
        choices: [
          { id: 'ct1_1', text: '영향 구간만 공지할게요', preview: '대외 ▼', checkpoint: false, effects: { internalChaos: -5, externalRisk: -10 }, response: '좋아요.' },
          { id: 'ct1_2', text: '전체 서비스 공지로 갈게요', preview: '조직 ▼', checkpoint: false, effects: { internalChaos: -10, externalRisk: 0 }, response: '알겠어요.' },
        ],
      },
    ],
    itemReward: 'notice_scope',
  },
  controlTower_to_techLeader: {
    stage: 2,
    steps: [
      { type: 'dialogue', text: '복구 범위 최소로 잡아주실 수 있나요?' },
      { type: 'dialogue', text: '네. 영향 받는 구간만 조치하고 나머지는 건드리지 않을게요.' },
      {
        type: 'choice',
        choices: [
          { id: 'ct2_1', text: '최소 범위로 할게요', preview: '대외 ▼', checkpoint: false, effects: { internalChaos: 0, externalRisk: -10 }, response: '좋아요.' },
          { id: 'ct2_2', text: '예방 차원으로 넓힐게요', preview: '조직 ▲', checkpoint: false, effects: { internalChaos: 10, externalRisk: 0 }, response: '괜찮아요. 상황 봐가며 조정하죠.' },
        ],
      },
    ],
    itemReward: 'scope_doc',
  },
  controlTower_to_techCommunicator: {
    stage: 3,
    steps: [
      { type: 'dialogue', text: '계약 측 전달용 요약 부탁해요.' },
      { type: 'dialogue', text: '영향·조치·예상 복구만 짧게 정리할게요.' },
      {
        type: 'choice',
        choices: [
          { id: 'ct3_1', text: '그걸로 전달할게요', preview: '대외 ▼', checkpoint: false, effects: { internalChaos: 0, externalRisk: -5 }, response: '좋아요.' },
          { id: 'ct3_2', text: '추가로 대안도 적어줄래요?', preview: '조직 ▼', checkpoint: false, effects: { internalChaos: -5, externalRisk: 0 }, response: '알겠어요.' },
        ],
      },
    ],
    itemReward: 'contract_brief',
  },
  controlTower_to_reporter: {
    stage: 4,
    steps: [
      { type: 'dialogue', text: '타임라인 기준 통일해 주실 수 있나요?' },
      { type: 'dialogue', text: '발생·감지·공지·조치·복구 시점으로 맞출게요.' },
      {
        type: 'choice',
        choices: [
          { id: 'ct4_1', text: '그 기준으로 기록할게요', preview: '혼란 ▼', checkpoint: false, effects: { internalChaos: -10, externalRisk: 0 }, response: '좋아요.' },
          { id: 'ct4_2', text: '우리 팀만 먼저 맞출게요', preview: '유지', checkpoint: false, effects: { internalChaos: 0, externalRisk: 0 }, response: '괜찮아요.' },
        ],
      },
    ],
    itemReward: 'timeline_standard',
  },
  reporter_to_communicator: {
    stage: 1,
    steps: [
      { type: 'dialogue', text: '공지 시점 기록해 두실 수 있나요?' },
      { type: 'dialogue', text: '네. 몇 시 몇 분에 뭐 올렸는지 적어둘게요.' },
      {
        type: 'choice',
        choices: [
          { id: 'r1_1', text: '시점까지 적어줄게요', preview: '혼란 ▼', checkpoint: false, effects: { internalChaos: -5, externalRisk: 0 }, response: '좋아요.' },
          { id: 'r1_2', text: '요약만 할게요', preview: '유지', checkpoint: false, effects: { internalChaos: 0, externalRisk: 0 }, response: '알겠어요.' },
        ],
      },
    ],
    itemReward: 'notice_log',
  },
  reporter_to_techLeader: {
    stage: 2,
    steps: [
      { type: 'dialogue', text: '기술 이벤트 시점 알려주실 수 있나요?' },
      { type: 'dialogue', text: '감지·원인 파악·조치 시작 시점 정리해 드릴게요.' },
      {
        type: 'choice',
        choices: [
          { id: 'r2_1', text: '그걸로 타임라인 채울게요', preview: '유지', checkpoint: false, effects: { internalChaos: 0, externalRisk: 0 }, response: '좋아요.' },
          { id: 'r2_2', text: '원인 추정 시점도 부탁해요', preview: '혼란 ▼', checkpoint: false, effects: { internalChaos: -5, externalRisk: 0 }, response: '알겠어요.' },
        ],
      },
    ],
    itemReward: 'event_timeline',
  },
  reporter_to_techCommunicator: {
    stage: 3,
    steps: [
      { type: 'dialogue', text: '고객 답변 기록도 타임라인에 넣을까요?' },
      { type: 'dialogue', text: '네. 첫 답변 시점이랑 주요 업데이트만 넣으면 돼요.' },
      {
        type: 'choice',
        choices: [
          { id: 'r3_1', text: '그렇게 넣을게요', preview: '대외 ▼', checkpoint: false, effects: { internalChaos: 0, externalRisk: -5 }, response: '좋아요.' },
          { id: 'r3_2', text: '요약만 할게요', preview: '유지', checkpoint: false, effects: { internalChaos: 0, externalRisk: 0 }, response: '괜찮아요.' },
        ],
      },
    ],
    itemReward: 'reply_log',
  },
  reporter_to_controlTower: {
    stage: 4,
    steps: [
      { type: 'dialogue', text: '최종 타임라인 검토 부탁해요.' },
      { type: 'dialogue', text: '시점 순서랑 누락만 확인할게요.' },
      {
        type: 'choice',
        choices: [
          { id: 'r4_1', text: '검토 반영할게요', preview: '혼란 ▼', checkpoint: false, effects: { internalChaos: -10, externalRisk: 0 }, response: '좋아요.' },
          { id: 'r4_2', text: '일단 이대로 마무리할게요', preview: '유지', checkpoint: false, effects: { internalChaos: 0, externalRisk: 0 }, response: '알겠어요.' },
        ],
      },
    ],
    itemReward: 'final_timeline',
  },
};

export function getDialogueKey(fromJob, toJob) {
  return `${fromJob}_to_${toJob}`;
}
