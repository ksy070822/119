import { useState, useEffect } from 'react';

const DIAGNOSIS_KEY = 'petMedical_diagnoses';
const STORAGE_KEY = 'petMedical_pets';

const getDiagnosesFromStorage = () => {
  try {
    const data = localStorage.getItem(DIAGNOSIS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const getPetsFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const savePetsToStorage = (pets) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
  } catch (error) {
    console.error('Failed to save pets:', error);
  }
};

export function MyPage({ onBack, onSelectPet, onViewDiagnosis, onAddPet }) {
  const [activeTab, setActiveTab] = useState('pets'); // 'pets' or 'records'
  const [pets, setPets] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [editingPet, setEditingPet] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  useEffect(() => {
    setPets(getPetsFromStorage());
    setDiagnoses(getDiagnosesFromStorage());
  }, []);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'Emergency':
      case 'high': return '#f44336';
      case 'High': return '#ff9800';
      case 'Moderate':
      case 'medium': return '#ff9800';
      case 'Low':
      case 'low': return '#4caf50';
      default: return '#666';
    }
  };

  const getRiskLabel = (riskLevel) => {
    switch(riskLevel) {
      case 'Emergency':
      case 'high': return '🔴 응급';
      case 'High': return '🟠 위험';
      case 'Moderate':
      case 'medium': return '🟡 보통';
      case 'Low':
      case 'low': return '🟢 경미';
      default: return riskLevel;
    }
  };

  const handleEditPet = (pet) => {
    setEditingPet(pet.id);
    setEditFormData({ ...pet });
  };

  const handleSaveEdit = () => {
    if (!editFormData) return;
    
    const updatedPets = pets.map(p => 
      p.id === editingPet ? { ...editFormData } : p
    );
    setPets(updatedPets);
    savePetsToStorage(updatedPets);
    setEditingPet(null);
    setEditFormData(null);
  };

  const handleCancelEdit = () => {
    setEditingPet(null);
    setEditFormData(null);
  };

  const handleDeletePet = (petId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const updatedPets = pets.filter(p => p.id !== petId);
      setPets(updatedPets);
      savePetsToStorage(updatedPets);
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <div className="flex items-center bg-background-light/80 p-4 pb-2 justify-between sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex size-12 shrink-0 items-center text-slate-800">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
            <span className="material-symbols-outlined text-3xl">arrow_back_ios_new</span>
          </button>
        </div>
        <h2 className="text-slate-800 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center font-display">마이페이지</h2>
        <div className="flex size-12 shrink-0 items-center justify-end"></div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-4 pt-2 pb-2 bg-background-light border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pets')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'pets'
              ? 'bg-primary text-white'
              : 'bg-surface-light text-slate-600'
          }`}
        >
          내 반려동물
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'records'
              ? 'bg-primary text-white'
              : 'bg-surface-light text-slate-600'
          }`}
        >
          진료 기록
        </button>
      </div>

      {activeTab === 'pets' && (
        <div className="px-4 pt-4 pb-40">
          {pets.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🐾</div>
              <p className="text-slate-500 mb-4">등록된 반려동물이 없습니다</p>
              <button
                onClick={() => onAddPet && onAddPet()}
                className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                반려동물 등록하기
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {pets.map(pet => (
                <div key={pet.id} className="bg-surface-light rounded-lg p-4 shadow-soft">
                  {editingPet === pet.id ? (
                    // 편집 모드
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
                        <input
                          type="text"
                          value={editFormData?.petName || ''}
                          onChange={(e) => handleInputChange('petName', e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">품종</label>
                        <input
                          type="text"
                          value={editFormData?.breed || ''}
                          onChange={(e) => handleInputChange('breed', e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">생년월일</label>
                        <input
                          type="date"
                          value={editFormData?.birthDate || ''}
                          onChange={(e) => handleInputChange('birthDate', e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                          저장
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 보기 모드
                    <>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl">
                          {pet.species === 'dog' ? '🐕' : '🐈'}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-slate-900 font-bold text-lg mb-1 font-display">{pet.petName}</h3>
                          <p className="text-slate-500 text-sm">
                            {pet.breed || '품종 미등록'} • {
                              pet.birthDate ? (() => {
                                const birth = new Date(pet.birthDate);
                                const today = new Date();
                                const age = today.getFullYear() - birth.getFullYear();
                                return `${age}세`;
                              })() : '나이 미등록'
                            }
                          </p>
                          {pet.sido && (
                            <p className="text-slate-400 text-xs mt-1">{pet.sido} {pet.sigungu}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onSelectPet && onSelectPet(pet)}
                          className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                          선택
                        </button>
                        <button
                          onClick={() => handleEditPet(pet)}
                          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeletePet(pet.id)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              <button
                onClick={() => onAddPet && onAddPet()}
                className="w-full bg-primary/10 text-primary py-4 rounded-lg font-bold hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                반려동물 추가하기
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'records' && (
        <div className="px-4 pt-4 pb-40">
          {diagnoses.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-slate-500 mb-2">아직 진료 기록이 없습니다</p>
              <p className="text-slate-400 text-sm">AI 진료를 받으면 기록이 저장됩니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {diagnoses.map(record => (
                <div
                  key={record.id}
                  className="bg-surface-light rounded-lg p-4 shadow-soft cursor-pointer hover:shadow-md transition-all"
                  onClick={() => onViewDiagnosis && onViewDiagnosis(record)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-slate-500 text-sm mb-1">{formatDate(record.created_at || record.date)}</p>
                      <h3 className="text-slate-900 font-bold text-base mb-1 font-display">
                        {record.petName || '반려동물'}
                      </h3>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: getRiskColor(record.riskLevel || record.emergency) }}
                    >
                      {getRiskLabel(record.riskLevel || record.emergency)}
                    </div>
                  </div>
                  <div className="mb-2">
                    <strong className="text-slate-700">진단:</strong>{' '}
                    <span className="text-slate-600">
                      {record.diagnosis || record.suspectedConditions?.[0]?.name || '일반 건강 이상'}
                    </span>
                  </div>
                  {record.symptom && (
                    <div className="mb-3">
                      <strong className="text-slate-700">증상:</strong>{' '}
                      <span className="text-slate-600">{record.symptom}</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDiagnosis && onViewDiagnosis(record);
                    }}
                    className="text-primary text-sm font-medium flex items-center gap-1"
                  >
                    상세 보기
                    <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

