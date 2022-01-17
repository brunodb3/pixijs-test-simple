import * as PIXI from "pixi.js";
import Keyboard from "./Keyboard";

export default class Player extends PIXI.Sprite {
  public vx: number;
  public vy: number;
  public velocity: number;

  private egg: boolean = false;
  private app: PIXI.Application;

  constructor(app: PIXI.Application) {
    const texture = PIXI.Loader.shared.resources["player.png"].texture;

    super(texture);

    this.vx = 0;
    this.vy = 0;
    this.velocity = 5;

    this.app = app;

    this.anchor.set(0.5);
    this.scale.set(0.5);
    this.position.set(
      this.app.renderer.width / 2,
      this.app.renderer.height / 2
    );

    const keyW = new Keyboard("KeyW");
    const keyS = new Keyboard("KeyS");
    const keyA = new Keyboard("KeyA");
    const keyD = new Keyboard("KeyD");

    const arrowUp = new Keyboard("ArrowUp");
    const arrowDown = new Keyboard("ArrowDown");
    const arrowLeft = new Keyboard("ArrowLeft");
    const arrowRight = new Keyboard("ArrowRight");

    this.addMovement(keyW, keyS, keyA, keyD);
    this.addMovement(arrowUp, arrowDown, arrowLeft, arrowRight);

    this.easterEgg();

    // updating player on every tick
    this.app.ticker.add(() => this.update());
  }

  private update() {
    const newX = this.x + this.vx;
    if (newX > 0 && newX < this.app.renderer.width) {
      this.x += this.vx;
    }

    const newY = this.y + this.vy;
    if (newY > 0 && newY < this.app.renderer.height) {
      this.y += this.vy;
    }
  }

  private easterEgg() {
    const keySpace = new Keyboard("Space");

    keySpace.press = () => {
      const facingLeft = this.scale.x < 0;

      const easterEggTexture =
        PIXI.Loader.shared.resources["player_egg.png"].texture;
      const originalTexture =
        PIXI.Loader.shared.resources["player.png"].texture;

      // textures can be undefined, so we don't do anything if they are
      if (!easterEggTexture || !originalTexture) return;

      this.egg = !this.egg;

      if (this.egg) {
        this.scale.set(0.25);
        if (facingLeft) this.scale.x = -0.25;

        this.texture = easterEggTexture;
      } else {
        this.scale.set(0.5);
        if (facingLeft) this.scale.x = 0 - 0.5;

        this.texture = originalTexture;
      }
    };
  }

  private addMovement(
    up: Keyboard,
    down: Keyboard,
    left: Keyboard,
    right: Keyboard
  ) {
    up.press = () => {
      this.vy = -this.velocity;
    };
    up.release = () => {
      if (down.isUp) {
        this.vy = 0;
      }
    };

    down.press = () => {
      this.vy = this.velocity;
    };
    down.release = () => {
      if (up.isUp) {
        this.vy = 0;
      }
    };

    left.press = () => {
      this.vx = -this.velocity;
      this.scale.x = 0 - Math.abs(this.scale.x);
    };
    left.release = () => {
      if (right.isUp) {
        this.vx = 0;
      }
    };

    right.press = () => {
      this.vx = this.velocity;
      this.scale.x = 0 + Math.abs(this.scale.x);
    };
    right.release = () => {
      if (left.isUp) {
        this.vx = 0;
      }
    };

    const updateVelocity = () => {
      if (up.isDown) this.vy = -this.velocity;
      if (down.isDown) this.vy = this.velocity;
      if (left.isDown) this.vx = -this.velocity;
      if (right.isDown) this.vx = this.velocity;
    };

    // sprinting
    const shiftLeft = new Keyboard("ShiftLeft");
    shiftLeft.press = () => {
      this.velocity = 10;
      updateVelocity();
    };

    shiftLeft.release = () => {
      this.velocity = 5;
      updateVelocity();
    };

    const shiftRight = new Keyboard("ShiftRight");
    shiftRight.press = shiftLeft.press;
    shiftRight.release = shiftLeft.release;
  }
}
