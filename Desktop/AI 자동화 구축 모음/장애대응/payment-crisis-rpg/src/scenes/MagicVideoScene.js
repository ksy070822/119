/**
 * 마법 시전 영상 씬 — 후속조치 완료 후, 보스전 직전 재생
 * public/assets/magic/magic.mp4 (약 1분 30초) 재생 후 보스전으로 전환
 */
import { getMagicVideoUrl } from '../data/assetPaths.js';

export class MagicVideoScene {
  constructor(game) {
    this.game = game;
    this.domRoot = null;
    this._video = null;
  }

  async init() {
    return this;
  }

  async enter() {
    const overlay = this.game.uiContainer;
    if (!overlay) return;
    overlay.innerHTML = '';

    const videoUrl = getMagicVideoUrl();
    this.domRoot = document.createElement('div');
    this.domRoot.className = 'magic-video-scene';
    this.domRoot.style.cssText = `
      position: absolute;
      inset: 0;
      background: #000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 25;
      pointer-events: auto;
    `;

    const skipBtn = document.createElement('button');
    skipBtn.type = 'button';
    skipBtn.className = 'scene-skip-btn';
    skipBtn.textContent = '스킵';
    skipBtn.style.cssText = `
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 30;
      padding: 8px 18px;
      font-size: 14px;
      font-weight: 600;
      color: #1a1510;
      background: linear-gradient(135deg, #d4af37, #b8860b);
      border: none;
      border-radius: 8px;
      cursor: pointer;
    `;
    skipBtn.addEventListener('click', () => this._finish());

    this._video = document.createElement('video');
    this._video.style.cssText = 'max-width: 100%; max-height: 100%; width: 100%; height: 100%; object-fit: contain;';
    this._video.src = videoUrl;
    this._video.playsInline = true;
    this._video.muted = false;
    this._video.autoplay = true;
    this._video.setAttribute('playsinline', '');
    this._video.addEventListener('ended', () => this._finish());
    this._video.addEventListener('error', () => this._finish());

    this.domRoot.appendChild(this._video);
    this.domRoot.appendChild(skipBtn);
    overlay.appendChild(this.domRoot);

    // 자동 재생을 위해 사용자 제스처 후 play 시도 (일부 브라우저 정책)
    this._video.play().catch(() => {});
  }

  _finish() {
    if (this._video) {
      this._video.pause();
      this._video.src = '';
      this._video = null;
    }
    if (this.domRoot?.parentNode) {
      this.domRoot.parentNode.removeChild(this.domRoot);
    }
    this.domRoot = null;
    this.game.switchScene('boss');
  }

  async exit() {
    if (this._video) {
      this._video.pause();
      this._video.src = '';
      this._video = null;
    }
    if (this.domRoot?.parentNode) {
      this.domRoot.parentNode.removeChild(this.domRoot);
    }
    this.domRoot = null;
  }
}
