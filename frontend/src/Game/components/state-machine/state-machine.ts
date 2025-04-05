import { ENABLE_LOGGING } from "@/Game/common/config";

export interface State {
  stateMachine: StateMachine;
  name: string;
  onEnter?: (args: unknown[]) => void;
  onUpdate?: () => void;
}

export class StateMachine {
  #id: string;
  #states: Map<string, State>;
  #currentState: State | undefined;
  #isChangingState: boolean;
  #changingStateQueue: { state: string; args: unknown[] }[];

  /**
   * @param {string} [id] the unique identifier for this state machine instance.
   */
  constructor(id?: string) {
    if (id === undefined) {
      this.#id = Phaser.Math.RND.uuid();
    } else {
      this.#id = id;
    }
    this.#isChangingState = false;
    this.#changingStateQueue = [];
    this.#currentState = undefined;
    this.#states = new Map();
  }

  get currentStateName() {
    return this.#currentState?.name;
  }

  public update(): void {
    const queuedState = this.#changingStateQueue.shift();
    if (queuedState !== undefined) {
      this.setState(queuedState.state, queuedState.args);
    }

    if (this.#currentState && this.#currentState.onUpdate) {
      this.#currentState.onUpdate();
    }
  }

  public setState(name: string, ...args: unknown[]): void {
    const methodName = 'setState';

    if (!this.#states.has(name)) {
      console.warn(`[${StateMachine.name}-${this.#id}:${methodName}] tried to change to unknown state: ${name}`);
      return;
    }

    if (this.#isCurrentState(name)) {
      return;
    }

    if (this.#isChangingState) {
      this.#changingStateQueue.push({ state: name, args });
      return;
    }

    this.#isChangingState = true;
    this.#log(methodName, `change from ${this.#currentState?.name ?? 'none'} to ${name}`);

    this.#currentState = this.#states.get(name) as State;

    if (this.#currentState.onEnter) {
      this.#log(methodName, `${this.#currentState.name} on enter invoked`);
      this.#currentState.onEnter(args);
    }

    this.#isChangingState = false;
  }

  public addState(state: State): void {
    state.stateMachine = this;
    this.#states.set(state.name, state);
  }

  #isCurrentState(name: string): boolean {
    if (!this.#currentState) {
      return false;
    }
    return this.#currentState.name === name;
  }

  #log(methodName: string, message: string) {
    if (!ENABLE_LOGGING) {
      return;
    }
    console.log(`[${StateMachine.name}-${this.#id}:${methodName}] ${message}`);
  }
}
