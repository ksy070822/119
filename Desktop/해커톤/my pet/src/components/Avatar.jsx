import React from "react";
import "./Avatar.css";

// HealthFlags 타입 정의 (주석으로 문서화)
// type HealthFlags = {
//   earIssue?: boolean;        // 귀 문제
//   digestionIssue?: boolean;  // 장/설사
//   skinIssue?: boolean;       // 피부
//   energyLevel?: number;      // 0~1 사이 (0이면 매우 피곤, 1이면 매우 활발)
//   fever?: boolean;           // 발열
// };

// species: "dog" | "cat" | "other"
// breed: 자유 텍스트
// healthFlags: 위에서 정의한 구조
export function Avatar({ pet, healthFlags = {}, size = "md" }) {
  const { name, species, breed } = pet || {};

  // 건강 상태에 따른 캐릭터 이모지 결정
  const getHealthEmoji = () => {
    const hasIssue = healthFlags.earIssue || healthFlags.digestionIssue || 
                     healthFlags.skinIssue || healthFlags.fever;
    const energyLevel = healthFlags.energyLevel || 1;
    
    // 아픈 상태
    if (hasIssue || energyLevel < 0.4) {
      if (species === "dog") {
        if (healthFlags.earIssue) return "😟"; // 귀 아픔
        if (healthFlags.digestionIssue) return "🤢"; // 소화 문제
        if (healthFlags.skinIssue) return "😰"; // 피부 문제
        if (healthFlags.fever) return "🤒"; // 발열
        return "😴"; // 피곤함
      } else if (species === "cat") {
        if (healthFlags.earIssue) return "😿"; // 귀 아픔
        if (healthFlags.digestionIssue) return "🤮"; // 소화 문제
        if (healthFlags.skinIssue) return "😾"; // 피부 문제
        if (healthFlags.fever) return "🤧"; // 발열
        return "😪"; // 피곤함
      }
      return "😔"; // 기타
    }
    
    // 회복 중 (에너지 레벨이 중간)
    if (energyLevel >= 0.4 && energyLevel < 0.7) {
      return species === "dog" ? "🙂" : species === "cat" ? "😼" : "😊";
    }
    
    // 건강한 상태
    return species === "dog" ? "🐶" : species === "cat" ? "🐱" : "🐾";
  };

  const baseEmoji = getHealthEmoji();

  // 품종에 따라 살짝 스타일 텍스트
  const breedLabel = (() => {
    if (!breed) return "알 수 없는 품종";

    const lower = breed.toLowerCase();
    if (lower.includes("푸들")) return "곱슬곱슬 푸들";
    if (lower.includes("말티즈")) return "포근한 말티즈";
    if (lower.includes("시바")) return "도도한 시바";
    if (lower.includes("코리안")) return "코리안 숏헤어";
    if (lower.includes("러시안")) return "러시안 블루";
    return breed;
  })();

  // 건강 상태 뱃지 텍스트
  const statusBadges = [];

  if (healthFlags.earIssue) statusBadges.push("👂 귀 불편");
  if (healthFlags.digestionIssue) statusBadges.push("🍽️ 소화 주의");
  if (healthFlags.skinIssue) statusBadges.push("🩹 피부 관리");
  if (healthFlags.fever) statusBadges.push("🌡️ 발열 의심");

  // 에너지 레벨에 따라 상태 라벨
  let energyLabel = "에너지 양호";
  if (typeof healthFlags.energyLevel === "number") {
    if (healthFlags.energyLevel < 0.3) energyLabel = "기운이 없어요";
    else if (healthFlags.energyLevel < 0.6) energyLabel = "조금 피곤해요";
    else energyLabel = "활발해요!";
  }

  const sizeClass = size === "lg" ? "avatar-card-lg" : "avatar-card-md";

  // 건강 상태에 따른 애니메이션 클래스
  const healthStatus = (() => {
    const hasIssue = healthFlags.earIssue || healthFlags.digestionIssue || 
                     healthFlags.skinIssue || healthFlags.fever;
    const energyLevel = healthFlags.energyLevel || 1;
    
    if (hasIssue || energyLevel < 0.4) return 'sick';
    if (energyLevel >= 0.4 && energyLevel < 0.7) return 'recovering';
    return 'healthy';
  })();

  // 건강 게이지 계산 (0~100%)
  const healthGauge = Math.round((healthFlags.energyLevel || 1) * 100);
  const gaugeColor = healthGauge >= 70 ? '#4ade80' : healthGauge >= 40 ? '#fbbf24' : '#f87171';

  return (
    <div className={`avatar-card ${sizeClass} avatar-${healthStatus}`}>
      <div className="avatar-emoji-wrapper">
        <div className={`avatar-emoji ${healthStatus === 'sick' ? 'sick-animation' : healthStatus === 'recovering' ? 'recovering-animation' : 'healthy-animation'}`}>
          {baseEmoji}
        </div>
        {/* 부위별 하이라이트 레이어 */}
        {healthFlags.earIssue && (
          <div className="avatar-health-layer avatar-layer-ear">
            <div className="health-highlight-ear"></div>
          </div>
        )}
        {healthFlags.digestionIssue && (
          <div className="avatar-health-layer avatar-layer-belly">
            <div className="health-highlight-belly"></div>
          </div>
        )}
        {healthFlags.skinIssue && (
          <div className="avatar-health-layer avatar-layer-skin">
            <div className="health-highlight-skin"></div>
          </div>
        )}
        {healthFlags.fever && (
          <div className="avatar-health-layer avatar-layer-fever">
            <div className="health-highlight-fever"></div>
          </div>
        )}
        {/* 건강 상태에 따라 작은 아이콘 겹치기 */}
        {healthFlags.earIssue && <div className="avatar-tag avatar-tag-ear">👂</div>}
        {healthFlags.digestionIssue && <div className="avatar-tag avatar-tag-belly">🤢</div>}
        {healthFlags.skinIssue && <div className="avatar-tag avatar-tag-skin">🩹</div>}
        {healthFlags.fever && <div className="avatar-tag avatar-tag-fever">🌡️</div>}
      </div>

      <div className="avatar-info">
        <div className="avatar-name">{name || "이름 없음"}</div>
        <div className="avatar-breed">{breedLabel}</div>
        
        {/* 건강 게이지 */}
        <div className="avatar-health-gauge">
          <div className="gauge-label">건강 게이지</div>
          <div className="gauge-bar">
            <div 
              className="gauge-fill" 
              style={{ 
                width: `${healthGauge}%`, 
                backgroundColor: gaugeColor,
                transition: 'width 0.5s ease, background-color 0.5s ease'
              }}
            ></div>
          </div>
          <div className="gauge-value">{healthGauge}%</div>
        </div>

        <div className="avatar-energy">{energyLabel}</div>

        {statusBadges.length > 0 && (
          <div className="avatar-badges">
            {statusBadges.map((badge, idx) => (
              <span key={idx} className="avatar-badge">
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
