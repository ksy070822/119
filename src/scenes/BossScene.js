/**
 * 보스전 씬 — 결제 대란 격파
 * Phase 0: 몬스터 미니 인카운터
 * Phase 1: 장애 이미지 + "영웅들이 힘을 모읍니다"
 * Phase 2: 마법 시전 영상 (magic.mp4)
 * Phase 3: 빛의 검으로 합쳐집니다 (아이템 합체)
 * Phase 4: 영웅들의 외침 + 필살기
 * Phase 5: 보스 격파
 * Phase 6: 승리
 */
import { CHARACTERS, INTRO_ORDER } from '../data/characters.js';
import {
  getVillageBg,
  getBossSprite,
  getCharacterMainImage,
  getItemImage,
  getMagicVideoUrl,
  MAGIC_CIRCLE,
  CLOUD_OVERLAY,
} from '../data/assetPaths.js';
import { ScreenEffects } from '../effects/ScreenEffects.js';

const HERO_SHOUT = '카카오 T의 힘으로, 혼란을 물리쳐라!';

const MONSTER_DATA = [
  { name: '지연의 달팽이', img: 'lag_snail.png', color: '#44ff88' },
  { name: '패닉 버블', img: 'panic_bubble.png', color: '#ff44aa' },
  { name: '분노의 버그', img: 'rage_bug.png', color: '#ff4444' },
];

// 각 페이즈별 최소 지속시간 (ms). Phase 2(영상)는 재생 종료/스킵으로 진행.
const PHASE_MIN_DURATION = [
  2000,  // phase 0: 몬스터 미니 인카운터
  2500,  // phase 1: 장애 이미지 + 영웅들이 힘을 모읍니다
  0,     // phase 2: 영상 (수동 진행)
  1500,  // phase 3: 빛의 검으로 합쳐집니다
  1500,  // phase 4: 영웅들의 외침
  1500,  // phase 5: 보스 격파
  2000,  // phase 6: 승리
];

// charId → item base이름 매핑
const CHAR_ITEM_MAP = {
  communicator: 0,
  techLeader: 1,
  techCommunicator: 2,
  controlTower: 3,
  reporter: 4,
};

export class BossScene {
  constructor(game) {
    this.game = game;
    this.domRoot = null;
    this._phase = 0;
    this._keyHandler = null;
    this._phaseStartTime = 0;
    this._canAdvance = true;
    this._screenEffects = null;
  }

  async init() {
    return this;
  }

  async enter() {
    const overlay = this.game.uiContainer;
    if (!overlay) return;
    overlay.innerHTML = '';

    this._phase = 0;
    this._screenEffects = new ScreenEffects(document.body);
    this._buildDOM();
    this._bindKeys();
    this._showPhase(0);
  }

  _buildDOM() {
    const overlay = this.game.uiContainer;
    this.domRoot = document.createElement('div');
    this.domRoot.className = 'boss-scene';
    this.domRoot.style.cssText = `
      position: absolute;
      inset: 0;
      background: linear-gradient(160deg, #b8d84d 0%, #7cb342 35%, #558b2f 70%, #33691e 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
      z-index: 20;
      overflow: hidden;
    `;

    this.domRoot.innerHTML = `
      <div class="boss-bg" id="boss-bg" style="
        position: absolute;
        inset: 0;
        background: url('${getVillageBg(5)}') center/cover no-repeat;
        opacity: 0.5;
      "></div>
      <div class="boss-vignette" id="boss-vignette" style="
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 1;
      "></div>
      <div class="boss-monsters" id="boss-monsters" style="
        display: none;
        gap: 24px;
        justify-content: center;
        align-items: center;
        margin-bottom: 24px;
        position: relative;
        z-index: 2;
      "></div>
      <div class="boss-monster" id="boss-monster" style="
        position: relative;
        width: 200px;
        height: 200px;
        margin-bottom: 32px;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <img id="boss-sprite-img" src="${getBossSprite(0)}" alt="Boss"
          style="
            width: 100%;
            height: 100%;
            object-fit: contain;
            filter: drop-shadow(0 0 30px #FF0000) drop-shadow(0 0 60px rgba(255,0,0,0.5));
            animation: bossPulse 2s infinite;
          "
          onerror="this.style.display='none';this.parentElement.style.background='radial-gradient(circle, #8B0000 0%, #000 70%)';this.parentElement.style.borderRadius='50%';this.parentElement.style.boxShadow='0 0 60px #FF0000';"
        >
      </div>
      <div class="boss-dialogue" id="boss-dialogue" style="
        background: rgba(0,0,0,0.9);
        border: 2px solid #d4af37;
        border-radius: 12px;
        padding: 20px 32px;
        max-width: 600px;
        text-align: center;
        margin-bottom: 24px;
        position: relative;
        z-index: 3;
      ">
        <div class="boss-speaker" id="boss-speaker" style="
          color: #FF4444;
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 8px;
        "></div>
        <div class="boss-text" id="boss-text" style="
          color: #fff;
          font-size: 18px;
          line-height: 1.6;
        "></div>
      </div>
      <div class="boss-heroes" id="boss-heroes" style="
        display: none;
        gap: 16px;
        margin-bottom: 24px;
        position: relative;
        z-index: 3;
      "></div>
      <div class="boss-items" id="boss-items" style="
        display: none;
        gap: 12px;
        margin-bottom: 24px;
        position: relative;
        z-index: 3;
      "></div>
      <div class="boss-magic-circle" id="boss-magic-circle" style="
        display: none;
        position: absolute;
        width: 200px;
        height: 200px;
        z-index: 2;
        pointer-events: none;
      ">
        <img src="${MAGIC_CIRCLE()}" alt="" style="width:100%;height:100%;opacity:0.6;animation:skill-magic-circle-spin 2s linear infinite;" onerror="this.parentElement.style.display='none';">
      </div>
      <div class="boss-shout" id="boss-shout" style="
        display: none;
        font-size: 24px;
        font-weight: 700;
        color: #FFD700;
        text-shadow: 0 0 20px rgba(255,215,0,0.8);
        margin-bottom: 24px;
        position: relative;
        z-index: 3;
      "></div>
      <div style="position:absolute;bottom:24px;left:0;right:0;display:flex;align-items:center;justify-content:center;gap:16px;z-index:4;">
        <span class="boss-hint" style="font-size:14px;color:rgba(255,255,255,0.6);">클릭 또는 Space로 진행</span>
        <button type="button" class="scene-skip-btn" style="padding:8px 18px;font-size:14px;font-weight:600;color:#1a1510;background:linear-gradient(135deg,#d4af37,#b8860b);border:none;border-radius:8px;cursor:pointer;">스킵</button>
      </div>
    `;

    overlay.appendChild(this.domRoot);
    this.domRoot.addEventListener('click', (e) => {
      if (e.target.closest('.scene-skip-btn')) return;
      this._advance();
    });
    this.domRoot.querySelector('.scene-skip-btn')?.addEventListener('click', (e) => { e.stopPropagation(); this._advance(); });
  }

  _bindKeys() {
    this._keyHandler = (e) => {
      if (e.key === ' ' || e.key === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        this._advance();
      }
    };
    window.addEventListener('keydown', this._keyHandler);
  }

  _unbindKeys() {
    window.removeEventListener('keydown', this._keyHandler);
  }

  _showPhase(phase) {
    this._phaseStartTime = Date.now();
    this._canAdvance = false;

    const minDuration = PHASE_MIN_DURATION[phase] ?? 1000;
    if (phase !== 2) {
      setTimeout(() => {
        this._canAdvance = true;
      }, minDuration);
    }

    const speakerEl = document.getElementById('boss-speaker');
    const textEl = document.getElementById('boss-text');
    const monsterEl = document.getElementById('boss-monster');
    const monstersEl = document.getElementById('boss-monsters');
    const heroesEl = document.getElementById('boss-heroes');
    const itemsEl = document.getElementById('boss-items');
    const shoutEl = document.getElementById('boss-shout');
    const bossImg = document.getElementById('boss-sprite-img');
    const magicCircle = document.getElementById('boss-magic-circle');
    const vignetteEl = document.getElementById('boss-vignette');
    const bgEl = document.getElementById('boss-bg');

    if (phase === 0) {
      // 몬스터 미니 인카운터
      monsterEl.style.display = 'none';
      monstersEl.style.display = 'flex';
      speakerEl.textContent = '나레이터';
      speakerEl.style.color = '#d4af37';
      textEl.textContent = '결제 대란의 잔존 버그들이 길을 가로막습니다!';

      MONSTER_DATA.forEach((m, i) => {
        setTimeout(() => {
          const mDiv = document.createElement('div');
          mDiv.style.cssText = `
            width: 80px;
            height: 80px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            animation: fadeInUp 0.5s ease-out;
          `;
          const img = document.createElement('img');
          img.src = `/assets/characters/monsters/${m.img}`;
          img.alt = m.name;
          img.style.cssText = `
            width: 64px;
            height: 64px;
            object-fit: contain;
            filter: drop-shadow(0 0 10px ${m.color});
          `;
          img.onerror = () => {
            img.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.style.cssText = `width:64px;height:64px;background:radial-gradient(circle,${m.color} 0%,transparent 70%);border-radius:50%;`;
            mDiv.insertBefore(fallback, mDiv.firstChild);
          };
          const label = document.createElement('div');
          label.textContent = m.name;
          label.style.cssText = `font-size:11px;color:${m.color};margin-top:4px;`;
          mDiv.appendChild(img);
          mDiv.appendChild(label);
          monstersEl.appendChild(mDiv);
        }, i * 400);
      });

      this._screenEffects?.shake(200);

    } else if (phase === 1) {
      // 장애 이미지 + "영웅들이 힘을 모읍니다" (크윽 영웅들 화면 제거·대체)
      monstersEl.style.display = 'none';
      monsterEl.style.display = 'none';
      if (bgEl) {
        bgEl.style.backgroundImage = `url('${getVillageBg(5)}')`;
        bgEl.style.opacity = '0.95';
      }
      if (vignetteEl) {
        vignetteEl.style.background = 'radial-gradient(ellipse at center, transparent 35%, rgba(80,0,0,0.5) 100%)';
      }
      speakerEl.textContent = '나레이터';
      speakerEl.style.color = '#d4af37';
      textEl.textContent = '영웅들이 힘을 모읍니다!';
      textEl.style.display = 'block';
      heroesEl.style.display = 'none';
      itemsEl.style.display = 'none';
      shoutEl.style.display = 'none';
      this._screenEffects?.shake(200);

    } else if (phase === 2) {
      // 마법 시전 영상 (magic.mp4) — 재생 후 다음 페이즈로 (한 번만 진행)
      monsterEl.style.display = 'none';
      if (bgEl) bgEl.style.opacity = '0.5';
      speakerEl.textContent = '';
      textEl.textContent = '';
      const overlay = this.game.uiContainer;
      const videoWrap = document.createElement('div');
      videoWrap.className = 'boss-video-wrap';
      videoWrap.style.cssText = `
        position: absolute; inset: 0; background: #000; z-index: 25;
        display: flex; align-items: center; justify-content: center; pointer-events: auto;
      `;
      const skipBtn = document.createElement('button');
      skipBtn.type = 'button';
      skipBtn.textContent = '스킵';
      skipBtn.className = 'scene-skip-btn';
      skipBtn.style.cssText = 'position:absolute;top:16px;right:16px;z-index:30;padding:8px 18px;font-size:14px;font-weight:600;color:#1a1510;background:linear-gradient(135deg,#d4af37,#b8860b);border:none;border-radius:8px;cursor:pointer;';
      const video = document.createElement('video');
      video.style.cssText = 'max-width:100%;max-height:100%;width:100%;height:100%;object-fit:contain;';
      video.src = getMagicVideoUrl();
      video.playsInline = true;
      video.muted = false;
      video.autoplay = true;
      video.setAttribute('playsinline', '');
      let videoEndHandled = false;
      const onVideoEnd = () => {
        if (videoEndHandled) return;
        videoEndHandled = true;
        skipBtn.removeEventListener('click', onVideoEnd);
        video.removeEventListener('ended', onVideoEnd);
        video.removeEventListener('error', onVideoEnd);
        video.pause();
        video.src = '';
        if (videoWrap.parentNode) videoWrap.remove();
        // 영상 종료: BGM 재개 (ending)
        this.game.bgm?.play('ending', true);
        if (this._phase !== 2) return;
        if (!document.getElementById('boss-text')) return;
        this._canAdvance = true;
        requestAnimationFrame(() => { this._advance(); });
      };
      skipBtn.addEventListener('click', onVideoEnd);
      video.addEventListener('ended', onVideoEnd);
      video.addEventListener('error', onVideoEnd);
      videoWrap.appendChild(video);
      videoWrap.appendChild(skipBtn);
      overlay.appendChild(videoWrap);
      // 영상 시작: BGM 정지
      this.game.bgm?.stop(false);
      video.play().catch(() => {});

    } else if (phase === 3) {
      // 빛의 검으로 합쳐집니다 (아이템 합체 강화)
      monsterEl.style.display = 'none';
      if (bgEl) {
        bgEl.style.backgroundImage = `url('${getVillageBg(5)}')`;
        bgEl.style.opacity = '0.5';
      }
      speakerEl.textContent = '';
      textEl.textContent = '아이템들이 빛의 검으로 합쳐집니다!';
      textEl.style.display = 'block';
      itemsEl.style.display = 'flex';
      itemsEl.style.position = 'relative';

      if (magicCircle) {
        magicCircle.style.display = 'block';
        magicCircle.style.top = '50%';
        magicCircle.style.left = '50%';
        magicCircle.style.transform = 'translate(-50%, -50%) scale(1.5)';
        magicCircle.style.opacity = '0.8';
      }

      // 아이템 등장 (확대·회전·빛)
      const itemDivs = [];
      INTRO_ORDER.forEach((charId, i) => {
        setTimeout(() => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'boss-item-merge';
          itemDiv.style.cssText = `
            width: 64px;
            height: 64px;
            background: radial-gradient(circle, rgba(255,215,0,0.3), rgba(255,215,0,0.05));
            border: 3px solid #FFD700;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: itemPulse 0.8s ease-in-out infinite;
            box-shadow: 0 0 24px rgba(255,215,0,0.8), inset 0 0 16px rgba(255,255,255,0.3);
            overflow: hidden;
            position: relative;
            transform: scale(0);
          `;
          const itemImg = getItemImage(charId, 0);
          if (itemImg) {
            const img = document.createElement('img');
            img.src = itemImg;
            img.alt = '';
            img.style.cssText = 'width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 0 8px #FFD700);';
            img.onerror = () => {
              img.style.display = 'none';
              itemDiv.textContent = this._getItemEmoji(i);
              itemDiv.style.fontSize = '28px';
            };
            itemDiv.appendChild(img);
          } else {
            itemDiv.textContent = this._getItemEmoji(i);
            itemDiv.style.fontSize = '28px';
          }
          itemsEl.appendChild(itemDiv);
          itemDivs.push(itemDiv);
          // 등장 애니메이션
          requestAnimationFrame(() => {
            itemDiv.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            itemDiv.style.transform = 'scale(1) rotate(0deg)';
          });
        }, i * 250);
      });

      // 모든 아이템 등장 후 (1.5초) → 중앙으로 수렴 + 폭발
      setTimeout(() => {
        this._screenEffects?.shake(300);
        this._screenEffects?.flash('rgba(255,215,0,0.6)', 400);
        itemDivs.forEach((div, idx) => {
          div.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
          div.style.transform = 'translate(0, -80px) scale(0.3) rotate(720deg)';
          div.style.opacity = '0';
        });
        // 중앙 집결 후 빛 폭발
        setTimeout(() => {
          this._screenEffects?.flash('rgba(255,255,255,0.9)', 200);
          this._screenEffects?.playSkillEffect(window.innerWidth / 2, window.innerHeight / 2 - 80);
          this._screenEffects?.shake(500);
          if (magicCircle) {
            magicCircle.style.transform = 'translate(-50%, -50%) scale(2.5)';
            magicCircle.style.opacity = '0';
            magicCircle.style.transition = 'all 0.6s ease-out';
          }
        }, 800);
      }, 1500);

    } else if (phase === 4) {
      // 영웅들의 외침 + 필살기 (보스 weakened 표시)
      monsterEl.style.display = 'flex';
      monsterEl.style.opacity = '1';
      monsterEl.style.transform = 'scale(1)';
      if (bossImg) {
        bossImg.src = getBossSprite(2);
        bossImg.style.filter = 'drop-shadow(0 0 60px #FFD700) drop-shadow(0 0 100px rgba(255,215,0,0.8))';
      }
      textEl.textContent = '';
      textEl.style.display = 'block';
      shoutEl.style.display = 'block';
      shoutEl.textContent = `"${HERO_SHOUT}"`;
      shoutEl.style.animation = 'fadeInUp 0.5s ease-out';
      if (magicCircle) magicCircle.style.display = 'none';

      this._screenEffects?.shake(400);
      this._screenEffects?.flash('rgba(255,215,0,0.4)', 300);
      this._screenEffects?.playSkillEffect(window.innerWidth / 2, window.innerHeight / 2);

    } else if (phase === 5) {
      // 보스 격파
      speakerEl.textContent = '결제 대란';
      speakerEl.style.color = '#FF4444';
      textEl.textContent = '크아아아... 이번엔... 졌다...';
      textEl.style.display = 'block';
      shoutEl.style.display = 'none';

      if (bossImg) {
        bossImg.src = getBossSprite(3);
        bossImg.style.filter = 'grayscale(1) drop-shadow(0 0 20px rgba(255,0,0,0.3))';
      }
      monsterEl.style.transition = 'all 0.8s ease';
      monsterEl.style.opacity = '0.3';
      monsterEl.style.transform = 'scale(0.5)';

      this._screenEffects?.flash('rgba(255,255,255,0.5)', 400);

    } else if (phase === 6) {
      // 승리
      speakerEl.textContent = '나레이터';
      speakerEl.style.color = '#d4af37';
      textEl.textContent = '결제 대란이 해소되었습니다!';
      textEl.style.display = 'block';

      monsterEl.style.transition = 'opacity 1s ease';
      monsterEl.style.opacity = '0';

      if (vignetteEl) {
        vignetteEl.style.background = 'radial-gradient(ellipse at center, transparent 40%, rgba(212,175,55,0.2) 100%)';
      }

      this._showCloudOverlay();
      this._createParticles();
      this._screenEffects?.flash('rgba(255,215,0,0.3)', 500);

    } else {
      // 엔딩으로 전환
      this._goToEnding();
      return;
    }
  }

  _getCharEmoji(charId) {
    const map = {
      communicator: '📢',
      techLeader: '⚙️',
      techCommunicator: '🔧',
      controlTower: '🧭',
      reporter: '⏱️',
    };
    return map[charId] || '👤';
  }

  _getItemEmoji(index) {
    return ['📜', '💻', '🔮', '🗺️', '⏱️'][index] || '📦';
  }

  _showCloudOverlay() {
    const img = document.createElement('img');
    img.src = CLOUD_OVERLAY();
    img.alt = '';
    img.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      pointer-events: none;
      z-index: 1;
      transition: opacity 1.5s ease;
    `;
    img.onerror = () => img.remove();
    this.domRoot.appendChild(img);
    requestAnimationFrame(() => {
      img.style.opacity = '0.15';
    });
  }

  _createParticles() {
    const container = this.domRoot;
    const colors = ['#FFD700', '#FFA500', '#FFEC8B', '#FFE4B5', '#FFFACD'];
    for (let i = 0; i < 40; i++) {
      const particle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 4 + Math.random() * 8;
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${50 + (Math.random() - 0.5) * 40}%;
        top: ${40 + (Math.random() - 0.5) * 30}%;
        animation: particleFade ${1.5 + Math.random()}s ease-out forwards;
        opacity: 0;
        box-shadow: 0 0 ${size}px ${color};
        z-index: 5;
      `;
      particle.style.animationDelay = `${i * 40}ms`;
      container.appendChild(particle);
    }
  }

  _advance() {
    if (!this._canAdvance) return;
    this._phase++;
    this._showPhase(this._phase);
  }

  _goToEnding() {
    this._unbindKeys();
    this.game.switchScene('ending');
  }

  async exit() {
    this._unbindKeys();
    if (this.domRoot?.parentNode) {
      this.domRoot.parentNode.removeChild(this.domRoot);
    }
  }
}
