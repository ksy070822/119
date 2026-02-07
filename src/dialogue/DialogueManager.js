/**
 * DialogueManager — dialogueId로 steps 순회; dialogue → choice → (checkpoint) → response → item_reward.
 * Choice 선택 시 state에 effects 반영, 다음 step으로.
 */
export class DialogueManager {
  constructor(dialoguesData, stateManager) {
    this.dialogues = dialoguesData?.dialogues ?? dialoguesData ?? {};
    this.state = stateManager;
    this.currentDialogueId = null;
    this.currentStepIndex = 0;
    this.currentSteps = [];
    this.lastSelectedChoiceId = null;
  }

  start(dialogueId) {
    this.currentDialogueId = dialogueId;
    const d = this.dialogues[dialogueId];
    this.currentSteps = d?.steps ?? [];
    this.currentStepIndex = 0;
    this.lastSelectedChoiceId = null;
    return this.currentStep();
  }

  currentStep() {
    return this.currentSteps[this.currentStepIndex] ?? null;
  }

  advance() {
    this.currentStepIndex++;
    return this.currentStep();
  }

  selectChoice(choice) {
    this.lastSelectedChoiceId = choice?.id ?? null;
    if (choice?.effects) this.state.applyEffects(choice.effects);
    this.currentStepIndex++;
    return this.currentStep();
  }

  getResponseForChoice(step) {
    if (step?.type !== 'response' || !step.conditions) return null;
    return step.conditions[this.lastSelectedChoiceId] ?? null;
  }

  isFinished() {
    return this.currentStepIndex >= this.currentSteps.length;
  }
}
