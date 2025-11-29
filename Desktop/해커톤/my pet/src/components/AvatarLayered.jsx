import React from "react";
import "./AvatarLayered.css";

/**
 * 디지털 트윈 아바타 - 레이어 기반
 * 
 * 구조:
 * - base: 기본 캐릭터 (dog_base.png, cat_base.png)
 * - breed: 품종별 레이어 (귀, 털 색, 패턴)
 * - health: 건강 상태 레이어 (부위별 하이라이트)
 */
export function AvatarLayered({ pet, healthFlags = {}, size = "md" }) {
  const { name, species, breed } = pet || {};

  // 품종별 레이어 경로 결정
  const getBreedLayers = () => {
    if (!breed) return { ear: null, pattern: null, color: null };
    
    const lower = breed.toLowerCase();
    const layers = { ear: null, pattern: null, color: null };
    
    // 귀 레이어
    if (lower.includes("푸들")) {
      layers.ear = "/assets/avatar/dog/ears_poodle.png";
    } else if (lower.includes("시바")) {
      layers.ear = "/assets/avatar/dog/ears_shiba.png";
    } else if (lower.includes("치와와")) {
      layers.ear = "/assets/avatar/dog/ears_chihuahua.png";
    } else if (lower.includes("코리안")) {
      layers.ear = "/assets/avatar/cat/ears_korean.png";
    } else if (lower.includes("스코티시")) {
      layers.ear = "/assets/avatar/cat/ears_scottish.png";
    }
    
    // 색상 필터 (품종별)
    if (lower.includes("말티즈") || lower.includes("화이트")) {
      layers.color = "white";
    } else if (lower.includes("시바") || lower.includes("브라운")) {
      layers.color = "brown";
    } else if (lower.includes("러시안")) {
      layers.color = "gray";
    }
    
    return layers;
  };

  const breedLayers = getBreedLayers();
  const baseImage = species === "dog" 
    ? "/assets/avatar/dog/base.png" 
    : species === "cat"
    ? "/assets/avatar/cat/base.png"
    : "/assets/avatar/other/base.png";

  // 건강 상태에 따른 레이어
  const healthLayers = [];
  if (healthFlags.earIssue) {
    healthLayers.push({ type: "ear", src: "/assets/avatar/layers/ear_red.png" });
  }
  if (healthFlags.digestionIssue) {
    healthLayers.push({ type: "belly", src: "/assets/avatar/layers/belly_alert.png" });
  }
  if (healthFlags.skinIssue) {
    healthLayers.push({ type: "skin", src: "/assets/avatar/layers/skin_patch.png" });
  }
  if (healthFlags.fever) {
    healthLayers.push({ type: "fever", src: "/assets/avatar/layers/head_heat.png" });
  }
  if ((healthFlags.energyLevel || 1) < 0.4) {
    healthLayers.push({ type: "tired", src: "/assets/avatar/layers/tired_eyes.png" });
  }

  // 건강 게이지 계산
  const healthGauge = Math.round((healthFlags.energyLevel || 1) * 100);
  const gaugeColor = healthGauge >= 70 ? '#4ade80' : healthGauge >= 40 ? '#fbbf24' : '#f87171';

  // 건강 상태
  const healthStatus = (() => {
    const hasIssue = healthFlags.earIssue || healthFlags.digestionIssue || 
                     healthFlags.skinIssue || healthFlags.fever;
    const energyLevel = healthFlags.energyLevel || 1;
    
    if (hasIssue || energyLevel < 0.4) return 'sick';
    if (energyLevel >= 0.4 && energyLevel < 0.7) return 'recovering';
    return 'healthy';
  })();

  const sizeClass = size === "lg" ? "avatar-layered-lg" : "avatar-layered-md";

  return (
    <div className={`avatar-layered-card ${sizeClass} avatar-${healthStatus}`}>
      {/* 캐릭터 레이어 컨테이너 */}
      <div className="avatar-layered-container">
        {/* 기본 캐릭터 (fallback: 이모지) */}
        <div className="avatar-base-layer">
          {baseImage ? (
            <img 
              src={baseImage} 
              alt={`${name} 기본`}
              className="avatar-base-img"
              onError={(e) => {
                // PNG가 없으면 이모지로 fallback
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = species === "dog" ? "🐶" : species === "cat" ? "🐱" : "🐾";
              }}
            />
          ) : (
            <span className="avatar-emoji-fallback">
              {species === "dog" ? "🐶" : species === "cat" ? "🐱" : "🐾"}
            </span>
          )}
        </div>

        {/* 품종별 레이어 */}
        {breedLayers.ear && (
          <div className="avatar-breed-layer avatar-ear-layer">
            <img 
              src={breedLayers.ear} 
              alt="귀"
              className="avatar-breed-img"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
        )}

        {/* 색상 필터 */}
        {breedLayers.color && (
          <div className={`avatar-color-filter avatar-color-${breedLayers.color}`}></div>
        )}

        {/* 건강 상태 레이어 */}
        {healthLayers.map((layer, idx) => (
          <div key={idx} className={`avatar-health-layer avatar-health-${layer.type}`}>
            <img 
              src={layer.src} 
              alt={layer.type}
              className="avatar-health-img"
              onError={(e) => {
                // PNG가 없으면 CSS로 하이라이트 표시
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                parent.classList.add('health-fallback');
              }}
            />
          </div>
        ))}

        {/* 건강 상태 태그 */}
        {healthFlags.earIssue && <div className="avatar-tag avatar-tag-ear">👂</div>}
        {healthFlags.digestionIssue && <div className="avatar-tag avatar-tag-belly">🤢</div>}
        {healthFlags.skinIssue && <div className="avatar-tag avatar-tag-skin">🩹</div>}
        {healthFlags.fever && <div className="avatar-tag avatar-tag-fever">🌡️</div>}
      </div>

      {/* 정보 영역 */}
      <div className="avatar-info">
        <div className="avatar-name">{name || "이름 없음"}</div>
        <div className="avatar-breed">{breed || "품종 미등록"}</div>
        
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

        {/* 상태 뱃지 */}
        <div className="avatar-badges">
          {healthFlags.earIssue && <span className="avatar-badge">👂 귀</span>}
          {healthFlags.digestionIssue && <span className="avatar-badge">🍽️ 소화</span>}
          {healthFlags.skinIssue && <span className="avatar-badge">🩹 피부</span>}
          {healthFlags.fever && <span className="avatar-badge">🌡️ 발열</span>}
        </div>
      </div>
    </div>
  );
}

