// 멀티 에이전트 오케스트레이터
import { callCSAgent } from './csAgent';
import { callInformationAgent } from './informationAgent';
import { callMedicalAgent } from './medicalAgent';
import { callOpsAgent } from './opsAgent';
import { callCareAgent } from './careAgent';
import { calculateTriageScore } from './triageEngine';
import { convertHealthFlagsFormat } from '../../utils/healthFlagsMapper';

export const runMultiAgentDiagnosis = async (petData, symptomData, onLogReceived) => {
  const logs = [];
  let csResult = null;
  let infoResult = null;
  let medicalResult = null;
  let triageResult = null;
  let opsResult = null;
  let careResult = null;

  try {
    // 1. CS Agent (Gemini Flash)
    onLogReceived({
      agent: 'CS Agent',
      role: '상담 간호사',
      icon: '💬',
      type: 'cs',
      content: '안녕하세요! 접수 도와드리겠습니다.',
      timestamp: Date.now()
    });

    await new Promise(resolve => setTimeout(resolve, 800));

    csResult = await callCSAgent(petData, symptomData);
    logs.push({
      agent: 'CS Agent',
      role: '상담 간호사',
      icon: '💬',
      type: 'cs',
      content: csResult.message,
      timestamp: Date.now()
    });
    onLogReceived(logs[logs.length - 1]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // CS Agent가 Information Agent에게 전달
    onLogReceived({
      agent: 'CS Agent',
      role: '상담 간호사',
      icon: '💬',
      type: 'cs',
      content: '🔍 Information Agent님, 증상 정보 분석 부탁드려요!',
      timestamp: Date.now()
    });

    await new Promise(resolve => setTimeout(resolve, 600));

    // 2. Information Agent (시뮬레이션)
    onLogReceived({
      agent: 'Information Agent',
      role: '정보수집가',
      icon: '🔍',
      type: 'info',
      content: '네, CS Agent님! 증상 정보 수집 시작하겠습니다.',
      timestamp: Date.now()
    });

    await new Promise(resolve => setTimeout(resolve, 800));

    infoResult = await callInformationAgent(petData, symptomData, csResult.json);
    
    logs.push({
      agent: 'Information Agent',
      role: '정보수집가',
      icon: '🔍',
      type: 'info',
      content: infoResult.message,
      timestamp: Date.now()
    });
    onLogReceived(logs[logs.length - 1]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Information Agent가 Medical Agent에게 전달
    onLogReceived({
      agent: 'Information Agent',
      role: '정보수집가',
      icon: '🔍',
      type: 'info',
      content: '👨‍⚕️ Veterinarian Agent님, 분석 결과 전달드립니다. 종합 진단 부탁드려요!',
      timestamp: Date.now()
    });

    await new Promise(resolve => setTimeout(resolve, 600));

    // 3. Medical Agent (GPT-4o)
    onLogReceived({
      agent: 'Veterinarian Agent',
      role: '전문 수의사',
      icon: '👨‍⚕️',
      type: 'medical',
      content: 'Information Agent님, 감사합니다! 종합 진단 시작하겠습니다.',
      timestamp: Date.now()
    });

    await new Promise(resolve => setTimeout(resolve, 800));

    medicalResult = await callMedicalAgent(petData, symptomData, csResult.json, infoResult.json);
    
    logs.push({
      agent: 'Veterinarian Agent',
      role: '전문 수의사',
      icon: '👨‍⚕️',
      type: 'medical',
      content: medicalResult.message,
      timestamp: Date.now()
    });
    onLogReceived(logs[logs.length - 1]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Medical Agent가 Triage Engine에게 요청
    onLogReceived({
      agent: 'Veterinarian Agent',
      role: '전문 수의사',
      icon: '👨‍⚕️',
      type: 'medical',
      content: '🚨 Triage Engine님, 응급도 평가 부탁드립니다. 진단 결과 전달드릴게요.',
      timestamp: Date.now()
    });

    await new Promise(resolve => setTimeout(resolve, 600));

    // 4. Triage Engine (GPT-4o) - 응급도 평가
    onLogReceived({
      agent: 'Triage Engine',
      role: '응급도 평가',
      icon: '🚨',
      type: 'triage',
      content: 'Veterinarian Agent님, 네! 응급도 평가 시작하겠습니다.',
      timestamp: Date.now()
    });

    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      triageResult = await calculateTriageScore(petData, symptomData, medicalResult.json, csResult.json);
      logs.push({
        agent: 'Triage Engine',
        role: '응급도 평가',
        icon: '🚨',
        type: 'triage',
        content: `응급도 평가 완료.\n\nTriage Score: ${triageResult.triage_score}/5\n응급도: ${triageResult.triage_level}\n시급성: ${triageResult.recommended_action_window}\n\n${triageResult.emergency_summary_kor}\n\n💾 Data Agent님, 진단서 작성 부탁드려요!`,
        timestamp: Date.now()
      });
      onLogReceived(logs[logs.length - 1]);
    } catch (err) {
      console.error('Triage 계산 오류:', err);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 5. Ops Agent (Claude 3.5 Sonnet)
    onLogReceived({
      agent: 'Data Agent',
      role: '데이터 처리자',
      icon: '💾',
      type: 'data',
      content: 'Triage Engine님, 네! 진료 기록 정리 시작하겠습니다.',
      timestamp: Date.now()
    });

    await new Promise(resolve => setTimeout(resolve, 800));

    opsResult = await callOpsAgent(
      petData, 
      symptomData, 
      medicalResult.json, 
      triageResult, 
      csResult.json, 
      infoResult.json
    );
    
    logs.push({
      agent: 'Data Agent',
      role: '데이터 처리자',
      icon: '💾',
      type: 'data',
      content: opsResult.message,
      timestamp: Date.now()
    });
    onLogReceived(logs[logs.length - 1]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Data Agent가 Care Agent에게 요청
    onLogReceived({
      agent: 'Data Agent',
      role: '데이터 처리자',
      icon: '💾',
      type: 'data',
      content: '💊 Care Agent님, 홈케어 가이드 작성 부탁드려요!',
      timestamp: Date.now()
    });

    await new Promise(resolve => setTimeout(resolve, 600));

    // 6. Care Agent (Gemini Pro)
    onLogReceived({
      agent: 'Care Agent',
      role: '케어 플래너',
      icon: '💊',
      type: 'care',
      content: 'Data Agent님, 네! 보호자님께 도움이 되는 케어 가이드 작성하겠습니다.',
      timestamp: Date.now()
    });

    await new Promise(resolve => setTimeout(resolve, 800));

    careResult = await callCareAgent(
      petData, 
      opsResult.json, 
      medicalResult.json, 
      triageResult
    );
    
    logs.push({
      agent: 'Care Agent',
      role: '케어 플래너',
      icon: '💊',
      type: 'care',
      content: careResult.message,
      timestamp: Date.now()
    });
    onLogReceived(logs[logs.length - 1]);

    await new Promise(resolve => setTimeout(resolve, 800));

    // 최종 완료 메시지
    onLogReceived({
      agent: 'CS Agent',
      role: '상담 간호사',
      icon: '💬',
      type: 'cs',
      content: '✅ 모든 에이전트 협업 완료! 진단서가 준비되었습니다.',
      timestamp: Date.now()
    });

    // 최종 진단서 생성
    const medicalLog = opsResult.json.medical_log;
    const ownerSheet = opsResult.json.owner_friendly_diagnosis_sheet;
    const healthFlags = convertHealthFlagsFormat(triageResult?.health_flags || medicalLog.health_flags || {});
    
    const finalDiagnosis = {
      id: Date.now().toString(),
      created_at: Date.now(),
      petId: petData.id,
      petName: petData.petName,
      diagnosis: medicalLog.possible_diseases?.[0]?.name_kor || '일반 건강 이상',
      probability: medicalLog.possible_diseases?.[0]?.probability || 0.6,
      riskLevel: medicalLog.risk_level || 'moderate',
      emergency: medicalLog.risk_level === 'emergency' ? 'high' : 
                 medicalLog.risk_level === 'high' ? 'high' :
                 medicalLog.risk_level === 'moderate' ? 'medium' : 'low',
      actions: ownerSheet.immediate_home_actions || [],
      hospitalVisit: medicalLog.need_hospital_visit || false,
      hospitalVisitTime: medicalLog.hospital_visit_timing || '증상 악화 시',
      description: medicalResult.json.primary_assessment_kor || '증상 기반 분석',
      careGuide: careResult.fullGuide,
      conversationHistory: [],
      triage_score: medicalLog.triage_score || triageResult?.triage_score || 2,
      triage_level: medicalLog.triage_level || triageResult?.triage_level || 'yellow',
      healthFlags: healthFlags,
      // 추가 정보
      ownerSheet: ownerSheet,
      hospitalPacket: opsResult.json.hospital_previsit_packet,
      carePlan: careResult.json
    };

    return {
      logs,
      finalDiagnosis
    };

  } catch (error) {
    console.error('멀티 에이전트 오류:', error);
    throw error;
  }
};
