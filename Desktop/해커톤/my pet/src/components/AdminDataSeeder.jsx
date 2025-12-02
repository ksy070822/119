/**
 * Firestore 마스터 데이터 시드 관리 컴포넌트
 * 개발/관리자용 - 한 번만 실행하면 됩니다
 */

import { useState } from 'react';
import { seedAll, seedDiseaseProfiles, seedSymptomTags, seedFollowUpQuestions } from '../utils/seedDiseasesUtils';
import { seedOwnerFAQ, seedUsers, seedAllDummyData } from '../utils/seedDummyDataUtils';

export default function AdminDataSeeder() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  const handleSeedAll = async (force = false) => {
    setLoading(true);
    setStatus('시드 시작...');
    setLogs([]);
    addLog(force ? '🚀 모든 마스터 데이터 강제 시드 시작' : '🚀 모든 마스터 데이터 시드 시작', 'info');
    addLog('💡 이 작업은 AI API를 사용하지 않습니다. Firestore에만 데이터를 저장합니다.', 'info');

    try {
      console.log('[Seed] 시작 - AI API 미사용');
      const results = await seedAll(force);
      console.log('[Seed] 완료:', results);
      
      if (results.diseases > 0) {
        addLog(`✅ 질병 프로필: ${results.diseases}개 추가됨`, 'success');
      } else {
        addLog(`⚠️ 질병 프로필: 기존 데이터가 있어 건너뜀`, 'warning');
      }
      
      if (results.tags > 0) {
        addLog(`✅ 증상 태그: ${results.tags}개 추가됨`, 'success');
      } else {
        addLog(`⚠️ 증상 태그: 기존 데이터가 있어 건너뜀`, 'warning');
      }
      
      if (results.questions > 0) {
        addLog(`✅ 추천 질문: ${results.questions}개 세트 추가됨`, 'success');
      } else {
        addLog(`⚠️ 추천 질문: 기존 데이터가 있어 건너뜀`, 'warning');
      }
      
      if (results.errors && results.errors.length > 0) {
        results.errors.forEach(err => addLog(`❌ ${err}`, 'error'));
        setStatus('⚠️ 일부 오류 발생');
      } else if (results.diseases === 0 && results.tags === 0 && results.questions === 0) {
        setStatus('⚠️ 모든 데이터가 이미 존재함');
        addLog('💡 Firestore 콘솔에서 컬렉션을 확인하세요', 'info');
      } else {
        setStatus('✅ 완료!');
      }
      
      addLog('🎉 모든 마스터 데이터 시드 완료!', 'success');
    } catch (error) {
      setStatus('❌ 오류 발생');
      addLog(`오류: ${error.message}`, 'error');
      addLog(`상세: ${error.stack || '스택 정보 없음'}`, 'error');
      console.error('[Seed] 시드 오류:', error);
      console.error('[Seed] 오류 상세:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDiseases = async () => {
    setLoading(true);
    setStatus('질병 데이터 시드 중...');
    setLogs([]);
    addLog('🌱 질병 프로필 시드 시작', 'info');
    addLog('💡 AI API 미사용 - Firestore에만 저장', 'info');

    try {
      console.log('[Seed] 질병 프로필 시드 시작');
      const count = await seedDiseaseProfiles();
      console.log('[Seed] 질병 프로필 시드 완료:', count);
      setStatus('✅ 질병 데이터 완료');
      addLog(`질병 프로필 ${count}개 시드 완료`, 'success');
    } catch (error) {
      if (error.message.includes('기존 데이터')) {
        setStatus('⚠️ 기존 데이터 존재');
        addLog(error.message, 'warning');
      } else {
        setStatus('❌ 오류 발생');
        addLog(`오류: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSeedTags = async () => {
    setLoading(true);
    setStatus('증상 태그 시드 중...');
    setLogs([]);
    addLog('🌱 증상 태그 시드 시작', 'info');
    addLog('💡 AI API 미사용 - Firestore에만 저장', 'info');

    try {
      console.log('[Seed] 증상 태그 시드 시작');
      const count = await seedSymptomTags();
      console.log('[Seed] 증상 태그 시드 완료:', count);
      setStatus('✅ 증상 태그 완료');
      addLog(`증상 태그 ${count}개 시드 완료`, 'success');
    } catch (error) {
      if (error.message.includes('기존 데이터')) {
        setStatus('⚠️ 기존 데이터 존재');
        addLog(error.message, 'warning');
      } else {
        setStatus('❌ 오류 발생');
        addLog(`오류: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSeedQuestions = async () => {
    setLoading(true);
    setStatus('추천 질문 시드 중...');
    setLogs([]);
    addLog('🌱 추천 질문 시드 시작', 'info');
    addLog('💡 AI API 미사용 - Firestore에만 저장', 'info');

    try {
      console.log('[Seed] 추천 질문 시드 시작');
      const count = await seedFollowUpQuestions();
      console.log('[Seed] 추천 질문 시드 완료:', count);
      setStatus('✅ 추천 질문 완료');
      addLog(`추천 질문 ${count}개 세트 시드 완료`, 'success');
    } catch (error) {
      if (error.message.includes('기존 데이터')) {
        setStatus('⚠️ 기존 데이터 존재');
        addLog(error.message, 'warning');
      } else {
        setStatus('❌ 오류 발생');
        addLog(`오류: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSeedFAQ = async (force = false) => {
    setLoading(true);
    setStatus('FAQ 데이터 시드 중...');
    setLogs([]);
    addLog('📚 FAQ 데이터 시드 시작', 'info');
    addLog('💡 AI의사가 보호자 질문에 참고할 수 있는 FAQ 데이터를 업로드합니다.', 'info');

    try {
      console.log('[Seed] FAQ 데이터 시드 시작');
      const result = await seedOwnerFAQ(force);
      console.log('[Seed] FAQ 데이터 시드 완료:', result);
      
      if (result.success) {
        setStatus('✅ FAQ 데이터 완료');
        addLog(`FAQ 데이터 ${result.count}개 업로드 완료`, 'success');
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach(err => addLog(`⚠️ ${err}`, 'warning'));
        }
      } else {
        setStatus('❌ 오류 발생');
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach(err => addLog(`❌ ${err}`, 'error'));
        }
      }
    } catch (error) {
      if (error.message.includes('기존 데이터')) {
        setStatus('⚠️ 기존 데이터 존재');
        addLog(error.message, 'warning');
      } else {
        setStatus('❌ 오류 발생');
        addLog(`오류: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSeedUserData = async (force = false) => {
    setLoading(true);
    setStatus('유저 데이터 시드 중...');
    setLogs([]);
    addLog('👥 유저 데이터 시드 시작', 'info');
    addLog('💡 더미 유저 데이터를 업로드합니다.', 'info');

    try {
      console.log('[Seed] 유저 데이터 시드 시작');
      const result = await seedUsers(force);
      console.log('[Seed] 유저 데이터 시드 완료:', result);
      
      if (result.success) {
        setStatus('✅ 유저 데이터 완료');
        addLog(`유저 데이터 ${result.count}개 업로드 완료`, 'success');
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach(err => addLog(`⚠️ ${err}`, 'warning'));
        }
      } else {
        setStatus('❌ 오류 발생');
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach(err => addLog(`❌ ${err}`, 'error'));
        }
      }
    } catch (error) {
      if (error.message.includes('기존 데이터')) {
        setStatus('⚠️ 기존 데이터 존재');
        addLog(error.message, 'warning');
      } else {
        setStatus('❌ 오류 발생');
        addLog(`오류: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSeedAllDummyData = async (force = false) => {
    setLoading(true);
    setStatus('더미데이터 시드 시작...');
    setLogs([]);
    addLog(force ? '🚀 모든 더미데이터 강제 시드 시작' : '🚀 모든 더미데이터 시드 시작', 'info');
    addLog('💡 FAQ 및 유저 데이터를 업로드합니다.', 'info');

    try {
      console.log('[Seed] 더미데이터 시드 시작');
      const results = await seedAllDummyData(force);
      console.log('[Seed] 더미데이터 시드 완료:', results);
      
      if (results.faq.success) {
        addLog(`✅ FAQ 데이터: ${results.faq.count}개 추가됨`, 'success');
      } else {
        addLog(`⚠️ FAQ 데이터: ${results.faq.errors?.[0] || '업로드 실패'}`, 'warning');
      }
      
      if (results.users.success) {
        addLog(`✅ 유저 데이터: ${results.users.count}개 추가됨`, 'success');
      } else {
        addLog(`⚠️ 유저 데이터: ${results.users.errors?.[0] || '업로드 실패'}`, 'warning');
      }
      
      if (results.faq.errors && results.faq.errors.length > 0) {
        results.faq.errors.forEach(err => addLog(`❌ FAQ 오류: ${err}`, 'error'));
      }
      if (results.users.errors && results.users.errors.length > 0) {
        results.users.errors.forEach(err => addLog(`❌ 유저 오류: ${err}`, 'error'));
      }
      
      if (results.faq.success && results.users.success) {
        setStatus('✅ 완료!');
      } else {
        setStatus('⚠️ 일부 오류 발생');
      }
      
      addLog('🎉 더미데이터 시드 완료!', 'success');
    } catch (error) {
      setStatus('❌ 오류 발생');
      addLog(`오류: ${error.message}`, 'error');
      console.error('[Seed] 더미데이터 시드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          🔧 Firestore 마스터 데이터 시드
        </h2>
        <p className="text-slate-600 text-sm mb-6">
          질병 마스터 데이터를 Firestore에 넣는 관리자 도구입니다.
          <br />
          <span className="text-amber-600 font-medium">⚠️ 한 번만 실행하면 됩니다. 기존 데이터가 있으면 건너뜁니다.</span>
        </p>

        {/* 상태 표시 */}
        {status && (
          <div className={`mb-4 p-3 rounded-lg ${
            status.includes('✅') ? 'bg-emerald-50 text-emerald-700' :
            status.includes('❌') ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {status}
          </div>
        )}

        {/* 버튼들 */}
        <div className="space-y-3">
          <button
            onClick={() => handleSeedAll(false)}
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {loading ? '⏳ 처리 중...' : '🚀 전체 시드 (권장)'}
          </button>
          
          <button
            onClick={() => handleSeedAll(true)}
            disabled={loading}
            className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
          >
            {loading ? '⏳ 처리 중...' : '⚠️ 강제 시드 (기존 데이터 무시)'}
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleSeedDiseases}
              disabled={loading}
              className="py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
              질병만
            </button>
            <button
              onClick={handleSeedTags}
              disabled={loading}
              className="py-2 px-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
              태그만
            </button>
            <button
              onClick={handleSeedQuestions}
              disabled={loading}
              className="py-2 px-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
              질문만
            </button>
          </div>
        </div>

        {/* 로그 표시 */}
        {logs.length > 0 && (
          <div className="mt-6 bg-slate-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">실행 로그</h3>
            <div className="space-y-1 font-mono text-xs">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    log.type === 'success' ? 'text-emerald-600' :
                    log.type === 'error' ? 'text-red-600' :
                    log.type === 'warning' ? 'text-amber-600' :
                    'text-slate-600'
                  }`}
                >
                  <span className="text-slate-400">[{log.time}]</span> {log.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 안내 */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
          <p className="font-semibold mb-2">📋 시드되는 컬렉션:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><code className="bg-white px-1 rounded">diseaseProfiles</code> - 종별 질병 정보 (연령/성별/긴급도 포함)</li>
            <li><code className="bg-white px-1 rounded">symptomTags</code> - 증상 태그 마스터</li>
            <li><code className="bg-white px-1 rounded">followUpQuestions</code> - 태그별 추천 질문</li>
          </ul>
        </div>
      </div>

      {/* 더미데이터 시드 섹션 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          📦 더미데이터 업로드
        </h2>
        <p className="text-slate-600 text-sm mb-6">
          FAQ 데이터(250개)와 유저 더미데이터(300개)를 Firestore에 업로드합니다.
          <br />
          <span className="text-amber-600 font-medium">⚠️ 한 번만 실행하면 됩니다. 기존 데이터가 있으면 건너뜁니다.</span>
        </p>

        {/* 버튼들 */}
        <div className="space-y-3">
          <button
            onClick={() => handleSeedAllDummyData(false)}
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {loading ? '⏳ 처리 중...' : '📦 전체 더미데이터 업로드 (FAQ + 유저)'}
          </button>
          
          <button
            onClick={() => handleSeedAllDummyData(true)}
            disabled={loading}
            className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
          >
            {loading ? '⏳ 처리 중...' : '⚠️ 강제 업로드 (기존 데이터 무시)'}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSeedFAQ(false)}
              disabled={loading}
              className="py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
              FAQ만 (250개)
            </button>
            <button
              onClick={() => handleSeedUserData(false)}
              disabled={loading}
              className="py-2 px-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
              유저만 (300개)
            </button>
          </div>
        </div>

        {/* 안내 */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
          <p className="font-semibold mb-2">📋 업로드되는 컬렉션:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><code className="bg-white px-1 rounded">owner_faq</code> - 동물별 대표 질병 FAQ (AI의사 참고용)</li>
            <li><code className="bg-white px-1 rounded">users</code> - 더미 유저 데이터 (300개)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

