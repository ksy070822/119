/**
 * InputManager — 키 상태 저장, isKeyDown(key), isKeyJustPressed(key) (Space용)
 * 게임 루프에서 한 프레임마다 justPressed 상태 초기화 필요.
 */
export class InputManager {
  constructor() {
    this.keys = {};
    this.justPressed = {};
    this._bind();
  }

  _bind() {
    window.addEventListener('keydown', (e) => this._onKeyDown(e));
    window.addEventListener('keyup', (e) => this._onKeyUp(e));
  }

  _onKeyDown(e) {
    const key = e.code || e.key;
    if (!this.keys[key]) {
      this.keys[key] = true;
      this.justPressed[key] = true;
    }
  }

  _onKeyUp(e) {
    const key = e.code || e.key;
    this.keys[key] = false;
  }

  isKeyDown(key) {
    return !!this.keys[key];
  }

  isKeyJustPressed(key) {
    return !!this.justPressed[key];
  }

  /** 매 프레임 끝에서 호출하여 justPressed 초기화 */
  clearJustPressed() {
    this.justPressed = {};
  }
}
