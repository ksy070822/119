/**
 * 관리자 페이지
 * API 키 설정 및 Firestore 데이터 시드 관리
 */

import { useState, useEffect } from 'react';
import { getAllApiKeys, saveAllApiKeys, API_KEY_TYPES } from '../services/apiKeyManager';
import AdminDataSeeder from './AdminDataSeeder';

// 관리자 이메일 목록 (나중에 확장 가능)
const ADMIN_EMAILS = [
  'kim.sy@kakao.com'
];

// 테스트 모드 체크 (URL 파라미터 또는 localStorage)
const isTestMode = () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('test') === 'true') return true;
  if (localStorage.getItem('admin_test_mode') === 'true') return true;
  return false;
};

// 관리자 접근 권한 체크
const checkAdminAccess = (userEmail) => {
  // 테스트 모드면 항상 허용
  if (isTestMode()) {
    return true;
  }
  
  // 특정 이메일 체크
  if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
    return true;
  }
  
  return false;
};

export default function AdminPage({ currentUser, onBack }) {
  const [hasAccess, setHasAccess] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    openai: '',
    anthropic: ''
  });
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState({
    gemini: false,
    openai: false,
    anthropic: false
  });

  useEffect(() => {
    // 접근 권한 체크
    const userEmail = currentUser?.email;
    const access = checkAdminAccess(userEmail);
    setHasAccess(access);

    if (access) {
      // API 키 로드
      const storedKeys = getAllApiKeys();
      setApiKeys({
        gemini: storedKeys[API_KEY_TYPES.GEMINI] || '',
        openai: storedKeys[API_KEY_TYPES.OPENAI] || '',
        anthropic: storedKeys[API_KEY_TYPES.ANTHROPIC] || ''
      });
    }
  }, [currentUser]);

  const toggleShowApiKey = (key) => {
    setShowApiKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveApiKeys = () => {
    saveAllApiKeys({
      [API_KEY_TYPES.GEMINI]: apiKeys.gemini,
      [API_KEY_TYPES.OPENAI]: apiKeys.openai,
      [API_KEY_TYPES.ANTHROPIC]: apiKeys.anthropic
    });
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  };

  // 접근 권한 없음
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">접근 권한 없음</h2>
          <p className="text-slate-600 mb-6">
            관리자 페이지에 접근할 수 없습니다.
          </p>
          {!isTestMode() && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4 text-sm text-blue-700">
              <p className="font-medium mb-1">테스트 모드로 접근:</p>
              <p className="text-xs">
                URL에 <code className="bg-white px-2 py-1 rounded">?test=true</code> 추가
                <br />
                또는 개발자 콘솔에서:
                <br />
                <code className="bg-white px-2 py-1 rounded">localStorage.setItem('admin_test_mode', 'true')</code>
              </p>
            </div>
          )}
          <button
            onClick={onBack}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <div className="flex items-center bg-background-light/80 p-4 pb-2 justify-between sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex size-12 shrink-0 items-center text-slate-800">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
            <span className="material-symbols-outlined text-3xl">arrow_back_ios_new</span>
          </button>
        </div>
        <h2 className="text-slate-800 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center font-display">
          관리자 페이지
        </h2>
        <div className="w-12"></div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 pb-40">
        <div className="space-y-6">
          {/* 테스트 모드 표시 */}
          {isTestMode() && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3 text-sm text-amber-800">
              <p className="font-medium flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                테스트 모드로 접근 중
              </p>
            </div>
          )}

          {/* API 키 설정 섹션 */}
          <div className="bg-surface-light rounded-lg p-4 shadow-soft">
            <h3 className="text-slate-900 font-bold text-lg mb-1 font-display flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">key</span>
              API 키 설정
            </h3>
            <p className="text-slate-500 text-sm mb-4">
              AI 진단 기능을 사용하려면 API 키를 입력하세요.
            </p>

            {/* Gemini API Key */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Google Gemini API 키
                <span className="text-xs text-slate-400 ml-2">(CS Agent, Care Agent)</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showApiKeys.gemini ? 'text' : 'password'}
                    value={apiKeys.gemini}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                    placeholder="AIza..."
                    className="w-full p-3 pr-10 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-primary focus:border-primary text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowApiKey('gemini')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showApiKeys.gemini ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              {apiKeys.gemini && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  설정됨
                </p>
              )}
            </div>

            {/* OpenAI API Key */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                OpenAI API 키
                <span className="text-xs text-slate-400 ml-2">(Medical Agent, Triage Engine)</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showApiKeys.openai ? 'text' : 'password'}
                    value={apiKeys.openai}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                    placeholder="sk-proj-..."
                    className="w-full p-3 pr-10 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-primary focus:border-primary text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowApiKey('openai')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showApiKeys.openai ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              {apiKeys.openai && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  설정됨
                </p>
              )}
            </div>

            {/* Anthropic API Key */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Anthropic API 키
                <span className="text-xs text-slate-400 ml-2">(Ops Agent)</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showApiKeys.anthropic ? 'text' : 'password'}
                    value={apiKeys.anthropic}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, anthropic: e.target.value }))}
                    placeholder="sk-ant-..."
                    className="w-full p-3 pr-10 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-primary focus:border-primary text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowApiKey('anthropic')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showApiKeys.anthropic ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              {apiKeys.anthropic && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  설정됨
                </p>
              )}
            </div>

            {/* 저장 버튼 */}
            <button
              onClick={handleSaveApiKeys}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              {apiKeySaved ? (
                <>
                  <span className="material-symbols-outlined">check</span>
                  저장 완료!
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  API 키 저장
                </>
              )}
            </button>

            {/* 안내 메시지 */}
            <div className="mt-4 bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
              <p className="font-medium mb-1">API 키 발급 방법:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>Gemini:</strong> <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                <li><strong>OpenAI:</strong> <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Platform</a></li>
                <li><strong>Anthropic:</strong> <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="underline">Anthropic Console</a></li>
              </ul>
            </div>

            {/* 보안 안내 */}
            <div className="mt-3 bg-amber-50 rounded-lg p-3 text-sm text-amber-700">
              <p className="flex items-start gap-2">
                <span className="material-symbols-outlined text-base mt-0.5">warning</span>
                <span>API 키는 브라우저의 로컬 스토리지에 저장됩니다. 공용 컴퓨터에서는 사용 후 키를 삭제해주세요.</span>
              </p>
            </div>
          </div>

          {/* Firestore 데이터 시드 섹션 */}
          <AdminDataSeeder />
        </div>
      </div>
    </div>
  );
}

