
import React from 'react';
import { SlideContent, SkillType } from '../types';

export const slides: SlideContent[] = [
  {
    id: 0,
    title: "업무 자동화의 시작: 데이터 동기화",
    subtitle: "Quest Start",
    category: "모험의 시작",
    content: (
      <div className="space-y-4">
        <p className="text-xl leading-relaxed text-slate-200">
          파편화된 도구들을 하나로 잇고, <br/>
          단순 반복 업무에서 해방되는 여정을 시작합니다.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-slate-800/50 p-3 rounded border border-slate-700 text-sm">
            <span className="text-yellow-400 font-bold">목표 1:</span> 채널 간 장벽 허물기
          </div>
          <div className="bg-slate-800/50 p-3 rounded border border-slate-700 text-sm">
            <span className="text-yellow-400 font-bold">목표 2:</span> AI 기반 데이터 자산화
          </div>
        </div>
      </div>
    )
  },
  {
    id: 1,
    title: "현실의 고통: 왜 자동화인가?",
    category: "문제 인식",
    content: (
      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center gap-4 bg-red-950/30 p-4 rounded-xl border border-red-500/20">
          <div className="text-2xl">😫</div>
          <div>
            <h4 className="font-bold text-red-200">도구의 파편화</h4>
            <p className="text-xs text-slate-400">아지트, 슬랙, 메일을 오가며 낭비되는 시간</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-red-950/30 p-4 rounded-xl border border-red-500/20">
          <div className="text-2xl">✍️</div>
          <div>
            <h4 className="font-bold text-red-200">수기 입력의 굴레</h4>
            <p className="text-xs text-slate-400">복사-붙여넣기로 점철된 영혼 없는 반복 업무</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "Step 1: 트리거 자동화",
    category: "성장",
    levelUp: SkillType.AUTOMATION,
    content: (
      <div className="space-y-4">
        <div className="bg-blue-600/10 border-2 border-blue-500/30 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 bg-blue-500 text-[10px] font-bold">ACTIVE</div>
          <h3 className="text-xl font-bold mb-2">실시간 이벤트 감지</h3>
          <p className="text-slate-300 text-sm">
            "게시글이 올라오면 즉시 반응합니다." <br/>
            수동 확인 없이 시스템이 먼저 움직이는 구조
          </p>
        </div>
        <p className="text-center text-blue-400 font-bold animate-pulse">자동화 장화(Boots)를 획득했습니다!</p>
      </div>
    )
  },
  {
    id: 3,
    title: "Step 2: 외부 시스템 연동 (API)",
    category: "확장",
    levelUp: SkillType.API,
    content: (
      <div className="bg-emerald-600/10 border-2 border-emerald-500/30 p-6 rounded-2xl">
        <h3 className="text-xl font-bold mb-3 text-emerald-400">API 허브 구축</h3>
        <p className="text-sm text-slate-300 mb-4">Google Apps Script를 중심으로 모든 도구를 연결합니다.</p>
        <div className="flex justify-between items-center text-[10px] font-mono">
          <div className="px-2 py-1 bg-slate-800 rounded">Slack API</div>
          <div className="text-emerald-500">↔</div>
          <div className="px-2 py-1 bg-slate-800 rounded font-bold text-yellow-500">HUB</div>
          <div className="text-emerald-500">↔</div>
          <div className="px-2 py-1 bg-slate-800 rounded">Agit API</div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "Step 3: 지능형 리포트 봇",
    category: "완성",
    levelUp: SkillType.BOT,
    content: (
      <div className="space-y-4">
        <div className="bg-white p-5 rounded-2xl shadow-2xl text-slate-900 border-b-4 border-slate-300">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold">CX Synergy Bot</span>
            <span className="text-[10px] text-slate-400">오전 9:00</span>
          </div>
          <p className="text-sm font-bold mb-1">📢 어제자 업무 리포트 도착!</p>
          <div className="bg-slate-50 p-2 rounded text-[10px] space-y-1">
            <p>• 총 문의: 1,240건 (자동분류 100%)</p>
            <p>• 긴급 대응 필요: 3건</p>
          </div>
        </div>
        <p className="text-center text-slate-400 text-sm">지능형 봇 헬멧을 장착했습니다!</p>
      </div>
    )
  },
  {
    id: 5,
    title: "Final Boss: 제미나이 AI",
    category: "각성",
    levelUp: SkillType.AI,
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-6 rounded-2xl border-2 border-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.3)]">
          <h3 className="text-xl font-bold mb-3 text-indigo-300">비정형 데이터의 정복</h3>
          <p className="text-sm text-slate-200">
            이미지 속 텍스트 분석, 복잡한 문의의 맥락 파악까지. <br/>
            이제 AI가 스스로 판단하고 데이터를 정제합니다.
          </p>
        </div>
        <div className="text-center py-2 bg-indigo-500 rounded-full text-xs font-bold animate-bounce">
          ✨ 제미나이 AI의 축복을 받았습니다!
        </div>
      </div>
    )
  },
  {
    id: 6,
    title: "퀘스트 완료: 업무 최강자 탄생",
    subtitle: "Quest Clear!",
    category: "마침표",
    isEnding: true,
    content: (
      <div className="text-center space-y-6">
        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-white to-yellow-400 animate-pulse">
          VICTORY!
        </h2>
        <div className="space-y-2">
          <p className="text-xl text-slate-200">모든 스킬을 마스터하여</p>
          <p className="text-3xl font-bold text-yellow-400">카카오모빌리티 업무 최강자</p>
          <p className="text-xl text-slate-200">로 전직하셨습니다.</p>
        </div>
        <div className="pt-4 flex justify-center gap-2">
          {["⚡ 자동화", "🔌 연동", "🤖 지능", "✨ AI"].map(s => (
            <span key={s} className="bg-slate-800 px-3 py-1 rounded-full text-[10px] border border-slate-600">
              {s}
            </span>
          ))}
        </div>
      </div>
    )
  }
];
