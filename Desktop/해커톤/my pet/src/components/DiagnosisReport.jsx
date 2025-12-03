import React, { useState, useRef } from 'react';
import './DiagnosisReport.css';
import { getPetImage } from '../utils/imagePaths';

// 동물 종류 한글 매핑
const SPECIES_LABELS = {
  dog: '강아지',
  cat: '고양이',
  rabbit: '토끼',
  hamster: '햄스터',
  bird: '조류',
  hedgehog: '고슴도치',
  reptile: '파충류',
  etc: '기타',
  other: '기타'
};

function DiagnosisReport({ petData, diagnosisResult, symptomData, onClose, onGoToHospital, onGoToTreatment }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const reportRef = useRef(null);

  // 진단서 번호 생성
  const reportNumber = `PMD.${Date.now().toString(36).toUpperCase().slice(-6)}`;

  const getPetInfo = () => {
    if (!petData) return { name: '미등록', age: '미상', weight: '미상', breed: '미상', species: 'dog' };

    const name = petData.petName || petData.name || '미등록';

    let age = '미상';
    if (petData.age) {
      age = petData.age;
    } else if (petData.birthDate) {
      const birth = new Date(petData.birthDate);
      const today = new Date();
      const years = today.getFullYear() - birth.getFullYear();
      const months = today.getMonth() - birth.getMonth();
      if (years > 0) {
        age = `${years}세`;
      } else if (months > 0) {
        age = `${months}개월`;
      } else {
        age = '1개월 미만';
      }
    }

    const weight = petData.weight ? `${petData.weight}kg` : '미상';
    const breed = petData.breed || '미상';
    const species = petData.species || 'dog';
    const speciesLabel = SPECIES_LABELS[species] || '기타';
    const gender = petData.sex || petData.gender;
    const genderLabel = gender === 'M' ? '수컷' : gender === 'F' ? '암컷' : '미상';
    const profileImage = getPetImage(petData, false);

    return { name, age, weight, breed, species, speciesLabel, gender, genderLabel, profileImage };
  };

  const petInfo = getPetInfo();

  const reportDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const reportDateTime = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getEmergencyInfo = (emergency) => {
    switch(emergency) {
      case 'high':
        return { text: '긴급', color: '#ef4444', bgColor: '#fef2f2' };
      case 'medium':
        return { text: '주의', color: '#f59e0b', bgColor: '#fffbeb' };
      default:
        return { text: '경미', color: '#22c55e', bgColor: '#f0fdf4' };
    }
  };

  const getTypeInfo = (emergency) => {
    switch(emergency) {
      case 'high':
        return { text: '급성', color: '#f97316', bgColor: '#fff7ed' };
      case 'medium':
        return { text: '만성', color: '#3b82f6', bgColor: '#eff6ff' };
      default:
        return { text: '일반', color: '#22c55e', bgColor: '#f0fdf4' };
    }
  };

  const emergencyInfo = getEmergencyInfo(diagnosisResult?.emergency);
  const typeInfo = getTypeInfo(diagnosisResult?.emergency);

  // 신뢰도 계산 (probability 또는 기본값)
  const confidence = diagnosisResult?.probability || diagnosisResult?.confidence || 75;

  const handleSaveAsImage = async () => {
    setIsSaving(true);
    try {
      const reportText = generateReportText();
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `진단서_${petData?.name || '반려동물'}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('진단서가 저장되었습니다.');
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const generateReportText = () => {
    return `
═══════════════════════════════════════
       PetMedical.AI 진단서
═══════════════════════════════════════

발급일시: ${reportDateTime}
진단서 번호: ${reportNumber}

───────────────────────────────────────
              환자 정보
───────────────────────────────────────
이름: ${petInfo.name}
종류: ${petInfo.speciesLabel}
나이: ${petInfo.age}
품종: ${petInfo.breed}
몸무게: ${petInfo.weight}
성별: ${petInfo.genderLabel}

───────────────────────────────────────
              증상 분석
───────────────────────────────────────
진료과목: ${symptomData?.department || '일반'}
증상: ${symptomData?.selectedSymptoms?.join(', ') || symptomData?.description || '직접 입력'}
상세 설명: ${symptomData?.userDescription || symptomData?.description || '없음'}

───────────────────────────────────────
              진단 결과
───────────────────────────────────────
진단명: ${diagnosisResult?.diagnosis || '진단 없음'}
신뢰도: ${confidence}%
응급도: ${emergencyInfo.text}
${diagnosisResult?.triage_score ? `중증도: ${diagnosisResult.triage_score}/5` : ''}

───────────────────────────────────────
              상세 설명
───────────────────────────────────────
${diagnosisResult?.description || '상세 설명 없음'}

───────────────────────────────────────
              권장 조치사항
───────────────────────────────────────
${diagnosisResult?.actions?.map((action, idx) => `${idx + 1}. ${action}`).join('\n') || '없음'}

═══════════════════════════════════════
    본 진단서는 AI 분석 결과입니다.
    정확한 진단을 위해 수의사 상담을
    권장합니다.
═══════════════════════════════════════
`;
  };

  const handleSendToHospital = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      if (onGoToHospital) {
        onGoToHospital();
      }
    }, 1000);
  };

  return (
    <div className="diagnosis-overlay">
      <div className="diagnosis-container" ref={reportRef}>
        {/* 헤더 */}
        <div className="diagnosis-header">
          <div className="header-left">
            <div className="header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div className="header-text">
              <h1>PetMedical.AI 진단서</h1>
              <p>AI 기반 반려동물 건강 분석 리포트</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* 스크롤 컨텐츠 */}
        <div className="diagnosis-content">
          {/* 날짜 및 번호 */}
          <div className="report-meta-card">
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span>{reportDateTime}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">No.</span>
              <span className="meta-value">{reportNumber}</span>
            </div>
          </div>

          {/* 반려동물 정보 */}
          <div className="info-card">
            <div className="pet-info-header">
              <div className="pet-avatar">
                <img src={petInfo.profileImage} alt={petInfo.name} />
              </div>
              <h3 className="card-title">반려동물 정보</h3>
            </div>
            <div className="pet-info-grid">
              <div className="info-item">
                <span className="info-label">이름</span>
                <span className="info-value">{petInfo.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">종류</span>
                <span className="info-value">{petInfo.speciesLabel}</span>
              </div>
              <div className="info-item">
                <span className="info-label">나이</span>
                <span className="info-value">{petInfo.age}</span>
              </div>
              <div className="info-item">
                <span className="info-label">품종</span>
                <span className="info-value">{petInfo.breed}</span>
              </div>
              <div className="info-item">
                <span className="info-label">체중</span>
                <span className="info-value">{petInfo.weight}</span>
              </div>
              <div className="info-item">
                <span className="info-label">성별</span>
                <span className="info-value">{petInfo.genderLabel}</span>
              </div>
            </div>
          </div>

          {/* 증상 정보 */}
          <div className="info-card">
            <div className="card-header">
              <span className="card-icon">🏥</span>
              <h3 className="card-title">증상 정보</h3>
            </div>
            {symptomData?.department && (
              <p className="symptom-department">진료과목: {symptomData.department}</p>
            )}
            {symptomData?.selectedSymptoms?.length > 0 && (
              <div className="symptom-tags">
                {symptomData.selectedSymptoms.map((symptom, idx) => (
                  <span key={idx} className="symptom-tag">{symptom}</span>
                ))}
              </div>
            )}
            {(symptomData?.userDescription || symptomData?.description) && (
              <div className="symptom-description">
                {symptomData?.userDescription || symptomData?.description}
              </div>
            )}
          </div>

          {/* 진단 결과 카드 */}
          <div className="diagnosis-result-card">
            <div className="result-header">
              <div className="result-title-row">
                <span className="warning-icon">⚠️</span>
                <h3>진단 결과</h3>
              </div>
              <div className="result-badges">
                <span className="badge" style={{ backgroundColor: typeInfo.color }}>{typeInfo.text}</span>
                <span className="badge" style={{ backgroundColor: emergencyInfo.color }}>{emergencyInfo.text}</span>
              </div>
            </div>

            <div className="diagnosis-name-box">
              <h2 className="diagnosis-name">{diagnosisResult?.diagnosis || '진단 결과 없음'}</h2>

              {/* 신뢰도 바 */}
              <div className="confidence-row">
                <span className="confidence-label">신뢰도</span>
                <div className="confidence-bar-container">
                  <div className="confidence-bar" style={{ width: `${confidence}%` }}></div>
                </div>
                <span className="confidence-value">{confidence}%</span>
              </div>
            </div>

            {/* 중증도 평가 */}
            {diagnosisResult?.triage_score !== undefined && (
              <div className="severity-row">
                <span className="severity-label">중증도 평가</span>
                <div className="severity-dots">
                  {[1, 2, 3, 4, 5].map(num => (
                    <div
                      key={num}
                      className={`severity-dot ${num <= diagnosisResult.triage_score ? 'filled' : ''}`}
                      style={{
                        backgroundColor: num <= diagnosisResult.triage_score
                          ? (diagnosisResult.triage_score >= 4 ? '#ef4444' :
                             diagnosisResult.triage_score >= 3 ? '#f59e0b' : '#22c55e')
                          : '#e5e7eb'
                      }}
                    />
                  ))}
                </div>
                <span className="severity-score">{diagnosisResult.triage_score}/5</span>
              </div>
            )}
          </div>

          {/* 상세 설명 */}
          {diagnosisResult?.description && (
            <div className="info-card">
              <div className="card-header">
                <span className="card-icon">📋</span>
                <h3 className="card-title">상세 설명</h3>
              </div>
              <p className="description-text">{diagnosisResult.description}</p>
            </div>
          )}

          {/* 권장 조치사항 */}
          {diagnosisResult?.actions?.length > 0 && (
            <div className="info-card">
              <div className="card-header">
                <span className="card-icon">✅</span>
                <h3 className="card-title">권장 조치사항</h3>
              </div>
              <ul className="actions-list">
                {diagnosisResult.actions.map((action, idx) => (
                  <li key={idx}>
                    <span className="action-number">{idx + 1}</span>
                    <span className="action-text">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 병원 방문 안내 */}
          {(diagnosisResult?.hospitalVisit || diagnosisResult?.emergency === 'high' || diagnosisResult?.emergency === 'medium') && (
            <div className="hospital-visit-card">
              <div className="hospital-icon">🏥</div>
              <div className="hospital-text">
                <strong>병원 방문 권장</strong>
                <p>{diagnosisResult?.hospitalVisitTime || '오늘 안에 내 방문하세요'}</p>
              </div>
            </div>
          )}

          {/* 면책 조항 */}
          <div className="disclaimer-card">
            <span className="disclaimer-icon">💡</span>
            <p>본 진단서는 AI 분석 결과로 참고용입니다.<br/>정확한 진단은 반드시 전문 수의사와 상담하세요.</p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="diagnosis-actions">
          <button
            className="action-btn save"
            onClick={handleSaveAsImage}
            disabled={isSaving}
          >
            <span>📥</span>
            <span>{isSaving ? '저장 중...' : '진단서 저장'}</span>
          </button>
          <button
            className="action-btn hospital"
            onClick={handleSendToHospital}
            disabled={isSending}
          >
            <span>⚠️</span>
            <span>{isSending ? '전송 중...' : '병원에 전송'}</span>
          </button>
          <button
            className="action-btn treatment"
            onClick={onGoToTreatment}
          >
            <span>❤️</span>
            <span>직접 치료하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiagnosisReport;
