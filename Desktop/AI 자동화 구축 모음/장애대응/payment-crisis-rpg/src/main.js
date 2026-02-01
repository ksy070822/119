/**
 * 결제 대란 RPG · Payment Crisis RPG v3
 * 타이틀 → 인트로 → 마을 → 컨트롤센터 → 엔딩
 */
import gsap from 'gsap';
import { Game } from './core/Game.js';

window.gsap = gsap;

async function init() {
  const game = new Game({
    width: 1280,
    height: 720,
    backgroundColor: 0x1a1a2e,
  });
  await game.init();
  game.run();
}

init().catch((err) => {
  console.error('Game init failed:', err);
});
