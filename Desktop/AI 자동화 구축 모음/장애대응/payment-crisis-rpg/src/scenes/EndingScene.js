/**
 * 엔딩 (v3) — 평화로운 마을, 주민 말풍선 → 점수 효과 → 자막
 * GAME_SCRIPT.md 기반 엔딩 시퀀스
 */
import { CHARACTERS } from '../data/characters.js';
import { BACKGROUNDS } from '../data/stages.js';
import { getVillageBg } from '../data/assetPaths.js';

const ENDING_TEXTS = {
  S: {
    title: '완벽한 위기 대응',
    message: '훌륭했습니다. 당신들 덕분에 마을이 지켜졌어요. 신중하면서도 빠른 판단이었어요. 주민들의 신뢰를 지켰습니다.',
    stars: '⭐⭐⭐',
    ccoComment: '훌륭했습니다. 당신들 덕분에 마을이 지켜졌어요.',
    ctoComment: '신중하면서도 빠른 판단이었어요. 주민들의 신뢰를 지켰습니다.',
  },
  A: {
    title: '훌륭한 대응',
    message: '몇 가지 아쉬운 점은 있었지만, 전체적으로 훌륭한 대응이었습니다. 다음엔 더 잘할 수 있을 거예요.',
    stars: '⭐⭐',
    ccoComment: '다음엔 더 잘할 수 있을 거예요. 경험이 쌓였으니까요.',
  },
  B: {
    title: '무난한 대응',
    message: '위기는 넘겼지만, 몇 가지 개선점이 보입니다. 기록을 남겨두었어요. 다음엔 참고하세요.',
    stars: '⭐',
    reporterComment: '기록을 남겨두었어요. 다음엔 참고하세요.',
  },
  C: {
    title: '개선 필요',
    message: '위기 대응에 많은 개선점이 보입니다. 하지만 괜찮습니다. 이것도 경험입니다. 다음엔 제가 더 도와드릴게요.',
    stars: '',
    // 테크커뮤니케이터 문구 제거. 대신 공통으로 "영웅들이 도와드릴게요. 마을의 평화는 계속될거예요." 사용
  },
};

const VILLAGER_BUBBLES = [
  { icon: '🚕', text: '택시도 다시 잘 잡히네!', speaker: '주민' },
  { icon: '🏍️', text: '바이크 타고 출근해야지!', speaker: '주민' },
  { icon: '⚡', text: '퀵 빨리 왔어 너무 좋아!!', speaker: '주민' },
];

export class EndingScene {
  constructor(game) {
    this.game = game;
    this.domRoot = null;
  }

  async init() {
    return this;
  }

  _wait(ms) {
    if (this._endingSkip) return Promise.resolve();
    return new Promise((r) => setTimeout(r, ms));
  }

  _showEndingFinalState(gradeWrap, barTextEl, restartBtn, jobId) {
    barTextEl.textContent = '';
    barTextEl.innerHTML = '';
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(gradeWrap, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out' });
    } else {
      gradeWrap.style.opacity = '1';
    }
    restartBtn.style.display = 'block';
    if (typeof gsap !== 'undefined') {
      gsap.from(restartBtn, { opacity: 0, y: 10, duration: 0.5 });
    }
    restartBtn.addEventListener('click', () => this._playActionMovieAndExit(jobId, restartBtn));
  }

  async enter() {
    const overlay = document.getElementById('dom-overlay');
    if (!overlay) return;
    overlay.innerHTML = '';

    const grade = this.game.state.get('endingGrade') ?? 'B';
    const ending = ENDING_TEXTS[grade] || ENDING_TEXTS.B;
    const jobId = this.game.state.get('selectedJob');
    const char = CHARACTERS[jobId];
    const chaos = this.game.state.get('internalChaos') ?? 0;
    const ext = this.game.state.get('externalRisk') ?? 0;

    const bgUrl = getVillageBg ? getVillageBg(1) : (BACKGROUNDS?.peacefulVillage || '');

    this.domRoot = document.createElement('div');
    this.domRoot.className = 'ending-screen';
    this.domRoot.style.cssText = 'position:absolute;inset:0;background:linear-gradient(160deg,#b8d84d 0%,#7cb342 35%,#558b2f 70%,#33691e 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;pointer-events:auto;overflow-y:auto;';

    this._endingSkip = false;
    this.domRoot.innerHTML = `
      <div class="ending-bg" style="position:absolute;inset:0;background:url('${bgUrl}') center/cover no-repeat;"></div>
      <button type="button" class="scene-skip-btn" style="position:absolute;top:16px;right:16px;z-index:10;padding:8px 18px;font-size:14px;font-weight:600;color:#1a1510;background:linear-gradient(135deg,#d4af37,#b8860b);border:none;border-radius:8px;cursor:pointer;">스킵</button>
      <div class="ending-villager-bubbles" style="display:flex;flex-direction:column;align-items:center;gap:8px;margin:24px 0;z-index:1;min-height:60px;"></div>
      <div class="ending-grade-wrap" style="display:flex;flex-direction:column;align-items:center;z-index:1;opacity:0;">
        <div class="grade" style="font-size:4rem;font-weight:900;color:#FFD700;text-shadow:0 2px 8px rgba(0,0,0,0.9),0 0 30px rgba(255,215,0,0.5);margin-bottom:8px;">${grade}</div>
        <div class="ending-stars" style="font-size:2rem;margin-bottom:16px;">${ending.stars || ''}</div>
        <div class="ending-title" style="font-size:1.8rem;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.9);">${ending.title}</div>
      </div>
      <div class="ending-bottom-bar" id="ending-bottom-bar">
        <div class="ending-bar-text" id="ending-bar-text"></div>
        <button class="btn-restart" id="btn-restart" style="display:none;padding:14px 40px;font-size:1rem;font-weight:700;color:#1a1510;background:linear-gradient(135deg,#d4af37,#b8860b);border:none;border-radius:10px;cursor:pointer;margin-top:16px;white-space:pre-line;line-height:1.5;">수고하셨습니다.&#10;행복한 연휴 보내세요 ♪</button>
      </div>
    `;

    overlay.appendChild(this.domRoot);
    this.domRoot.querySelector('.scene-skip-btn')?.addEventListener('click', () => { this._endingSkip = true; });

    const barTextEl = this.domRoot.querySelector('#ending-bar-text');
    const bubblesWrap = this.domRoot.querySelector('.ending-villager-bubbles');
    const gradeWrap = this.domRoot.querySelector('.ending-grade-wrap');
    const restartBtn = this.domRoot.querySelector('#btn-restart');

    // 특정 캐릭터 발화(ccoComment, ctoComment, reporterComment) 제거 — 등급별 캐릭터 멘트 없이 공통 문구만
    const subtitleLines = [
      '영웅들의 희생으로 결제대란이 물러간 후 카카오 T 마을에는 다시 평화가 찾아왔습니다.',
      '영웅들이 도와드릴게요. 카카오 T 마을의 평화는 계속될 거예요.',
      `조직 혼란: ${chaos}% · 대외 위험: ${ext}%`,
      '결제 대란은 물러갔습니다. 하지만 영웅들은 알고 있습니다. 언제든 다시 올 수 있다는 것을.',
      '그때까지, 마을은 평화롭습니다.',
      ...(char ? [`${char.name}으로 플레이했습니다.`] : []),
    ];

    const showBarText = (content, isHtml = false) => {
      if (isHtml) {
        barTextEl.innerHTML = content;
      } else {
        barTextEl.textContent = content;
      }
      barTextEl.style.opacity = '0';
      if (typeof gsap !== 'undefined') {
        gsap.to(barTextEl, { opacity: 1, duration: 0.5 });
      } else {
        barTextEl.style.opacity = '1';
      }
    };

    const hideBarText = () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(barTextEl, { opacity: 0, duration: 0.4 });
      } else {
        barTextEl.style.opacity = '0';
      }
    };

    // 1. 하단 검정 영역(게임 대화창과 동일)에 "마을의 평화가 찾아왔습니다" 표시
    barTextEl.className = 'ending-bar-text ending-bar-text--peace';
    barTextEl.innerHTML = '<span class="ending-peace-sparkle">마을의 평화가 찾아왔습니다.</span>';
    barTextEl.style.opacity = '0';
    if (typeof gsap !== 'undefined') gsap.to(barTextEl, { opacity: 1, duration: 0.8 });
    else barTextEl.style.opacity = '1';
    await this._wait(1800);
    if (this._endingSkip) {
      this._showEndingFinalState(gradeWrap, barTextEl, restartBtn, jobId);
      return;
    }

    // 2. 주민 말풍선 — 작게 (진한 말풍선, 세로)
    for (let i = 0; i < VILLAGER_BUBBLES.length; i++) {
      const v = VILLAGER_BUBBLES[i];
      const bubble = document.createElement('div');
      bubble.className = 'ending-villager-bubble villager-line';
      bubble.style.cssText = `
        color: #fff;
        font-size: 0.95rem;
        margin: 4px 0;
        padding: 6px 14px;
        background: rgba(0, 0, 0, 0.78);
        border-radius: 8px;
        white-space: pre-line;
        word-break: keep-all;
        opacity: 0;
        max-width: 220px;
        text-align: center;
      `;
      bubble.innerHTML = `<span style="font-size:1.1rem;margin-right:6px;">${v.icon}</span><strong style="color:#FFD700">${v.speaker}:</strong> "${v.text}"`;
      bubblesWrap.appendChild(bubble);
      if (typeof gsap !== 'undefined') {
        gsap.to(bubble, { opacity: 1, duration: 0.4 });
      } else {
        bubble.style.opacity = '1';
      }
      await this._wait(1200);
    }
    await this._wait(800);
    if (this._endingSkip) {
      this._showEndingFinalState(gradeWrap, barTextEl, restartBtn, jobId);
      return;
    }

    // 3. 하단 바에 나레이션 한 줄씩 순차 표시
    barTextEl.className = 'ending-bar-text';
    for (const line of subtitleLines) {
      showBarText(line);
      await this._wait(2500);
      if (this._endingSkip) break;
      hideBarText();
      await this._wait(400);
    }

    // 4. 점수 효과 노출 (화면 중앙)
    this._showEndingFinalState(gradeWrap, barTextEl, restartBtn, jobId);
  }

  /** '수고하셨습니다.' 클릭 — 캐릭터별 영상 없이 바로 타이틀(종료)로 복귀 */
  _playActionMovieAndExit(jobId, triggerBtn) {
    this.game.state.reset();
    this.game.switchScene('title');
  }

  async exit() {
    if (this.domRoot?.parentNode) {
      this.domRoot.parentNode.removeChild(this.domRoot);
    }
  }
}
