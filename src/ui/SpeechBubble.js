/**
 * 말풍선 — 타이핑 효과, 말풍선 꼬리 방향
 */
export class SpeechBubble {
  constructor(container) {
    this.container = container || document.body;
    this.element = null;
    this.isTyping = false;
    this.typeSpeed = 40;
  }

  create(x, y, direction = 'bottom') {
    this.element = document.createElement('div');
    this.element.className = 'speech-bubble';
    this.element.classList.add(`speech-bubble--${direction}`);
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    this.element.style.position = 'absolute';
    this.element.innerHTML = `
      <div class="speech-bubble__content">
        <span class="speech-bubble__text"></span>
      </div>
      <div class="speech-bubble__tail"></div>
    `;
    this.container.appendChild(this.element);

    if (typeof gsap !== 'undefined') {
      gsap.from(this.element, { scale: 0, opacity: 0, duration: 0.3, ease: 'back.out' });
    } else {
      this.element.style.opacity = '1';
    }
    return this;
  }

  async typeText(text, speakerName = null) {
    const content = this.element?.querySelector('.speech-bubble__content');
    const textEl = this.element?.querySelector('.speech-bubble__text');
    if (!content || !textEl) return;

    if (speakerName) {
      const nameEl = document.createElement('div');
      nameEl.className = 'speech-bubble__name';
      nameEl.textContent = speakerName;
      content.prepend(nameEl);
    }

    this.isTyping = true;
    textEl.textContent = '';

    for (let i = 0; i < text.length; i++) {
      if (!this.isTyping) {
        textEl.textContent = text;
        break;
      }
      textEl.textContent += text[i];
      await this.wait(this.typeSpeed);
    }
    this.isTyping = false;
  }

  skipTyping() {
    this.isTyping = false;
  }

  async hide() {
    if (!this.element) return;
    if (typeof gsap !== 'undefined') {
      await gsap.to(this.element, { scale: 0, opacity: 0, duration: 0.2 });
    }
    this.element.remove();
    this.element = null;
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
