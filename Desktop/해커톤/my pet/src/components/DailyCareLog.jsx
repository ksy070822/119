// src/components/DailyCareLog.jsx
import { useEffect, useState } from "react";
import "./DailyCareLog.css";
import { loadDailyLog, saveDailyLog, getTodayKey } from "../lib/careLogs";

export function DailyCareLog({ pet }) {
  const [log, setLog] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!pet) return;
    const today = getTodayKey();
    const loaded = loadDailyLog(pet.id, today);
    setLog(loaded);
  }, [pet]);

  if (!pet || !log) return null;

  const updateField = (field, value) => {
    const updated = { ...log, [field]: value };
    setLog(updated);
    // 자동 저장은 제거하고 저장 버튼으로만 저장
  };

  const handleSave = () => {
    saveDailyLog(pet.id, log);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inc = (field) => {
    updateField(field, (log[field] || 0) + 1);
  };

  const dec = (field) => {
    updateField(field, Math.max(0, (log[field] || 0) - 1));
  };

  return (
    <div className="carelog-card">
      <div className="carelog-header">
        <h3>오늘 케어 기록</h3>
        <span className="carelog-date">{log.date}</span>
      </div>

      <div className="carelog-row">
        <span>🍚 밥</span>
        <div className="carelog-counter">
          <button onClick={() => dec("mealCount")}>-</button>
          <span>{log.mealCount}</span>
          <button onClick={() => inc("mealCount")}>+</button>
        </div>
      </div>

      <div className="carelog-row">
        <span>💧 물</span>
        <div className="carelog-counter">
          <button onClick={() => dec("waterCount")}>-</button>
          <span>{log.waterCount}</span>
          <button onClick={() => inc("waterCount")}>+</button>
        </div>
      </div>

      <div className="carelog-row">
        <span>🚶 산책</span>
        <div className="carelog-counter">
          <button onClick={() => dec("walkCount")}>-</button>
          <span>{log.walkCount}</span>
          <button onClick={() => inc("walkCount")}>+</button>
        </div>
      </div>

      <div className="carelog-row">
        <span>🚽 배변</span>
        <div className="carelog-counter">
          <button onClick={() => dec("poopCount")}>-</button>
          <span>{log.poopCount}</span>
          <button onClick={() => inc("poopCount")}>+</button>
        </div>
      </div>

      <div className="carelog-row">
        <span>⚖️ 체중(kg)</span>
        <input
          type="number"
          value={log.weight || ""}
          onChange={(e) => updateField("weight", e.target.value)}
          className="carelog-input"
          step="0.1"
        />
      </div>

      <div className="carelog-row">
        <span>📝 메모</span>
        <textarea
          value={log.note || ""}
          onChange={(e) => updateField("note", e.target.value)}
          className="carelog-textarea"
          placeholder="오늘 아이 상태를 간단히 적어주세요."
        />
      </div>

      <div className="carelog-save-section">
        <button 
          onClick={handleSave}
          className={`carelog-save-btn ${saved ? 'saved' : ''}`}
        >
          {saved ? '✓ 저장되었습니다!' : '💾 저장하기'}
        </button>
      </div>
    </div>
  );
}

