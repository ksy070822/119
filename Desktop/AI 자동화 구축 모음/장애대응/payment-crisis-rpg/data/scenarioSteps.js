/**
 * 선형 시나리오 단계: 각 단계별 제목, 내레이션, 선택지 ID 목록
 */
export const SCENARIO_STEPS = [
  { stageId: 'S1', title: '장애 인지', narration: '결제 전면 실패가 보고되었습니다. 원인 불명, CS 인입 급증입니다. 첫 행동은?', choiceIds: ['S1_C1', 'S1_C2', 'S1_C3'] },
  { stageId: 'S1', title: '상황 전파', narration: '전사 장애 채널에 어떤 내용을 넣을까요?', choiceIds: ['S1_C4', 'S1_C5', 'S1_C6'] },
  { stageId: 'S2', title: '초기 공지 판단', narration: '마을 주민센터 전화문의 대기 100+. 공지를 할까요?', choiceIds: ['S2_C1', 'S2_C2', 'S2_C3'] },
  { stageId: 'S2', title: '비로그인 공지', narration: '어드민 접속 불가 시 마을 주민 공지 채널은?', choiceIds: ['S2_C4', 'S2_C5'] },
  { stageId: 'S3', title: '심화 공지 타이밍', narration: '장애가 100분 넘게 지속 중입니다. 법적 고지 시점이 임박했습니다.', choiceIds: ['S3_C1', 'S3_C2'] },
  { stageId: 'S4', title: '복구 판단', narration: '테크에서 "일부 정상화" 전달. 복구 공지할까요?', choiceIds: ['S4_C1', 'S4_C2'] },
  { stageId: 'S5', title: '후속 조치', narration: '장애가 종료되었습니다. 다음으로 할 일은?', choiceIds: ['S5_C1', 'S5_C2', 'S5_C3'] },
];
