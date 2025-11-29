import { useState } from 'react';
import './CareActionButton.css';

export function CareActionButton({ 
  action, 
  icon, 
  label, 
  onAction, 
  healthPoints = 0,
  cooldown = 0 
}) {
  const [lastActionTime, setLastActionTime] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleClick = () => {
    const now = Date.now();
    if (now - lastActionTime < cooldown * 1000) {
      return; // 쿨다운 중
    }

    setLastActionTime(now);
    setShowFeedback(true);
    
    if (onAction) {
      onAction(action);
    }

    setTimeout(() => setShowFeedback(false), 1500);
  };

  const isCooldown = Date.now() - lastActionTime < cooldown * 1000;

  return (
    <button
      onClick={handleClick}
      disabled={isCooldown}
      className={`care-action-btn ${isCooldown ? 'cooldown' : ''} ${showFeedback ? 'action-feedback' : ''}`}
    >
      <div className="care-action-icon">
        {icon}
      </div>
      <div className="care-action-label">{label}</div>
      {healthPoints > 0 && (
        <div className="care-action-points">+{healthPoints}HP</div>
      )}
      {showFeedback && (
        <div className="care-action-feedback">
          <span className="material-symbols-outlined">check_circle</span>
        </div>
      )}
    </button>
  );
}

