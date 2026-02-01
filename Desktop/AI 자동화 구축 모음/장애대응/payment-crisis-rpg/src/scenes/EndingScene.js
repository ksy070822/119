/**
 * 엔딩 (v3) — 평화로운 마을, 등급(S/A/B/C) + 리포트, 다시 하기
 */
import { CHARACTERS } from '../data/characters.js';
import { BACKGROUNDS } from '../data/stages.js';

const ENDING_TEXTS = {
  S: { title: '훌륭한 해소', message: '팀의 판단과 협업으로 결제 대란이 안정적으로 해소되었습니다.' },
  A: { title: '안정적 해소', message: '결제 대란이 해소되었습니다. 일부 리스크가 남았지만 전체적으로 잘 마무리되었어요.' },
  B: { title: '해소 완료', message: '결제 대란이 해소되었습니다. 다음에는 초기 대응을 더 조율해 보세요.' },
  C: { title: '해소됨', message: '결제 대란이 해소되었습니다. 기록을 남기고 다음 대비에 활용해 주세요.' },
};

export class EndingScene {
  constructor(game) {
    this.game = game;
    this.domRoot = null;
  }

  async init() {
    return this;
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

    this.domRoot = document.createElement('div');
    this.domRoot.className = 'ending-screen';
    this.domRoot.style.cssText = 'position:absolute;inset:0;background:linear-gradient(180deg,#1a2a1a 0%,#0f1a0f 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;pointer-events:auto;';
    this.domRoot.innerHTML = `
      <div class="ending-bg" style="position:absolute;inset:0;background:url('${BACKGROUNDS.peacefulVillage}') center/cover no-repeat;opacity:0.4;"></div>
      <div class="grade" style="font-size:4rem;font-weight:900;color:#FFD700;text-shadow:0 0 30px rgba(255,215,0,0.5);margin-bottom:16px;">${grade}</div>
      <div class="ending-title" style="font-size:1.8rem;color:#fff;margin-bottom:12px;">${ending.title}</div>
      <p class="ending-message" style="font-size:1.1rem;color:rgba(255,255,255,0.9);text-align:center;max-width:480px;margin-bottom:24px;">${ending.message}</p>
      <div class="ending-report" style="background:rgba(0,0,0,0.4);padding:16px 24px;border-radius:12px;margin-bottom:24px;font-size:14px;color:rgba(255,255,255,0.8);">
        조직 혼란: ${chaos}% · 대외 위험: ${ext}%
      </div>
      ${char ? `<p class="ending-role" style="color:rgba(255,255,255,0.6);margin-bottom:32px;">${char.name}으로 플레이했습니다.</p>` : ''}
      <button class="btn-restart" id="btn-restart">다시 도전</button>
    `;
    overlay.appendChild(this.domRoot);

    document.getElementById('btn-restart').addEventListener('click', () => {
      this.game.state.reset();
      this.game.switchScene('title');
    });
  }

  async exit() {
    if (this.domRoot && this.domRoot.parentNode) {
      this.domRoot.parentNode.removeChild(this.domRoot);
    }
  }
}
