export interface KeyboardKey {
  value: string;
  isUp: boolean;
  isDown: boolean;
  press?: any;
  release?: any;
  upHandler?: (event: KeyboardEvent) => void;
  downHandler?: (event: KeyboardEvent) => void;
  unsubscribe?: () => void;
}

export default class Keyboard {
  value: string;
  isUp: boolean = true;
  isDown: boolean = false;

  press?: () => void;
  release?: () => void;

  constructor(value: string) {
    this.value = value;

    window.addEventListener("keyup", this.upHandler.bind(this));
    window.addEventListener("keydown", this.downHandler.bind(this));
  }

  public upHandler(event: KeyboardEvent): void {
    if (event.code === this.value) {
      if (this.release) {
        this.release();
      }

      this.isUp = true;
      this.isDown = false;
    }
  }

  public downHandler(event: KeyboardEvent): void {
    if (event.code === this.value) {
      if (this.press) {
        this.press();
      }

      this.isUp = false;
      this.isDown = true;
    }
  }
}
