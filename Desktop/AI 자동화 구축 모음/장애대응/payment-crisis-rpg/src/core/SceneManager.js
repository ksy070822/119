/**
 * 씬 전환 (v3): title → intro → village → controlCenter → ending
 */
import { TitleScene } from '../scenes/TitleScene.js';
import { IntroScene } from '../scenes/IntroScene.js';
import { VillageScene } from '../scenes/VillageScene.js';
import { ControlCenterScene } from '../scenes/ControlCenterScene.js';
import { EndingScene } from '../scenes/EndingScene.js';

export class SceneManager {
  constructor(game) {
    this.game = game;
    this.scenes = {};
    this.current = null;
  }

  async init() {
    this.scenes.title = new TitleScene(this.game);
    this.scenes.intro = new IntroScene(this.game);
    this.scenes.village = new VillageScene(this.game);
    this.scenes.controlCenter = new ControlCenterScene(this.game);
    this.scenes.ending = new EndingScene(this.game);
    await this.scenes.title.init?.();
    await this.scenes.intro.init?.();
    await this.scenes.village.init?.();
    await this.scenes.controlCenter.init?.();
    await this.scenes.ending.init?.();
    return this;
  }

  async goTo(name) {
    if (this.current) {
      await this.current.exit?.();
      this.game.pixi.stage.removeChildren();
      const overlay = document.getElementById('dom-overlay');
      if (overlay) overlay.innerHTML = '';
    }
    this.current = this.scenes[name];
    if (!this.current) throw new Error('Unknown scene: ' + name);
    await this.current.enter?.();
  }
}
