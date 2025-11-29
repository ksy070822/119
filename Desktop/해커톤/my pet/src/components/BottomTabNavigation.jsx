// src/components/BottomTabNavigation.jsx

export function BottomTabNavigation({ currentTab, onTabChange }) {
  const tabs = [
    { id: 'care', label: '내 동물 돌보기', icon: 'pets' },
    { id: 'diagnosis', label: 'AI진단하기', icon: 'medical_services' },
    { id: 'hospital', label: '병원예약하기', icon: 'local_hospital' },
    { id: 'records', label: '기록보기', icon: 'receipt_long' },
    { id: 'mypage', label: '마이페이지', icon: 'person' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-slate-200 z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              currentTab === tab.id 
                ? 'text-primary' 
                : 'text-slate-400'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className={`material-symbols-outlined text-2xl mb-0.5 ${
              currentTab === tab.id ? 'font-bold' : ''
            }`}>
              {tab.icon}
            </span>
            <span className={`text-[10px] font-medium ${
              currentTab === tab.id ? 'text-primary' : 'text-slate-400'
            }`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

