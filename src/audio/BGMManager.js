/**
 * BGM 매니저 — 장면/스테이지별 평화·위기·소강·복구 분위기, RPG 스타일
 * Howler 사용. 브라우저 정책상 첫 사용자 클릭 후 재생(잠금 해제).
 */
import { Howl, Howler } from 'howler';
import { getBGMUrl } from '../data/assetPaths.js';

const FADE_MS = 600;
const DEFAULT_VOLUME = 0.5;

/** 씬 이름 → BGM 키 (파일 4개: peace, tension, crisis, ending) */
const SCENE_BGM = {
  title: 'peace',   // 인트로까지 peace
  intro: 'peace',
  game: null,
  boss: 'ending',   // 나머지 ending
  ending: 'ending',
};

/** 게임 스테이지 1~5 → BGM 키. 영웅 등장부터 tension, 심화공지~복구 crisis, 나머지 ending */
const STAGE_BGM = {
  1: 'tension',  // 영웅들 등장부터
  2: 'tension',
  3: 'crisis',   // 심화공지
  4: 'crisis',  // 복구까지
  5: 'ending',  // 나머지
};

export class BGMManager {
  constructor() {
    this._current = null;
    this._volume = DEFAULT_VOLUME;
    this._unlocked = false;
    this._pendingScene = null;
    this._pendingStage = null;
    this._hintShown = false;
  }

  /** 첫 클릭/터치 시 호출 — 오디오 잠금 해제 후 대기 중이던 BGM 재생 */
  unlock() {
    if (this._unlocked) return;
    this._unlocked = true;
    try {
      if (typeof Howler !== 'undefined' && Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume().then(() => this._playPending());
      } else {
        this._playPending();
      }
    } catch (_) {
      this._playPending();
    }
  }

  _playPending() {
    if (this._pendingStage != null) {
      const n = this._pendingStage;
      this._pendingStage = null;
      this._pendingScene = null;
      this.play(STAGE_BGM[n], true);
    } else if (this._pendingScene != null) {
      const name = this._pendingScene;
      this._pendingScene = null;
      if (name === 'game') return;
      const key = SCENE_BGM[name];
      if (key) this.play(key, true);
    }
  }

  _resolveUrl(key) {
    const url = getBGMUrl(key);
    if (!url) return null;
    if (typeof window === 'undefined' || !window.location?.origin) return url;
    const origin = window.location.origin;
    const path = url.startsWith('/') ? url : '/' + url;
    return origin + path;
  }

  _createHowl(key) {
    const src = this._resolveUrl(key);
    if (!src) return null;
    try {
      return new Howl({
        src: [src],
        loop: true,
        volume: this._volume,
        html5: true,
        onloaderror: (id, err) => {
          this._current = null;
          console.warn('[BGM] 파일을 불러올 수 없습니다:', src, err);
          this._showBGMHint();
        },
        onplayerror: () => {
          this._current = null;
          this._showBGMHint();
        },
      });
    } catch (_) {
      return null;
    }
  }

  _showBGMHint() {
    if (this._hintShown) return;
    this._hintShown = true;
    const msg = 'BGM: public/assets/music/ 폴더에 bgm_peace.mp3, bgm_tension.mp3, bgm_crisis.mp3, bgm_ending.mp3 를 넣어주세요.';
    console.info('[BGM]', msg);
    if (typeof document !== 'undefined') {
      const el = document.createElement('div');
      el.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);max-width:90%;padding:10px 16px;background:rgba(0,0,0,0.85);color:#ffc;font-size:12px;border-radius:8px;z-index:9999;text-align:center;';
      el.textContent = 'BGM 파일을 찾을 수 없습니다. public/assets/music/ 에 mp3 4개를 넣어주세요.';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }
  }

  stop(fade = true) {
    if (!this._current) return;
    const howl = this._current;
    this._current = null;
    if (fade && howl.fade) {
      howl.fade(howl.volume(), 0, FADE_MS);
      setTimeout(() => { howl.unload(); }, FADE_MS + 50);
    } else {
      howl.stop();
      howl.unload();
    }
  }

  play(key, fade = true) {
    if (!key) return;
    if (!this._unlocked) return;
    this.stop(fade);
    const howl = this._createHowl(key);
    if (!howl) return;
    this._current = howl;
    if (fade) {
      howl.volume(0);
      howl.play();
      howl.fade(0, this._volume, FADE_MS);
    } else {
      howl.volume(this._volume);
      howl.play();
    }
  }

  /** 씬 전환 시 호출 */
  playForScene(sceneName) {
    this._pendingStage = null;
    this._pendingScene = sceneName;
    if (sceneName === 'game') return;
    const key = SCENE_BGM[sceneName];
    if (!key) {
      this.stop(true);
      return;
    }
    if (!this._unlocked) return;
    this.play(key, true);
  }

  /** 게임 씬 내 스테이지 전환 시 호출 (1~5) */
  playForStage(stageNum) {
    this._pendingScene = null;
    this._pendingStage = Math.min(5, Math.max(1, stageNum));
    const key = STAGE_BGM[this._pendingStage];
    if (!key) return;
    if (!this._unlocked) return;
    this.play(key, true);
  }

  setVolume(v) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this._current) this._current.volume(this._volume);
  }
}
