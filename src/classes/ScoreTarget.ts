import * as PIXI from "pixi.js";

import Keyboard from "./Keyboard";

export default class ScoreTarget extends PIXI.Sprite {
  private egg: boolean = false;

  private app: PIXI.Application;

  constructor(app: PIXI.Application) {
    const texture = PIXI.Loader.shared.resources["target.png"].texture;

    super(texture);

    this.app = app;

    this.anchor.set(0.5);
    this.scale.set(0.15);

    this.easterEgg();

    this.moveRandom();
  }

  // moves the target randomly within the renderer
  public moveRandom() {
    const x = Math.floor(Math.random() * this.app.renderer.width);
    const y = Math.floor(Math.random() * this.app.renderer.height);

    this.position.set(x, y);
  }

  private easterEgg() {
    const keySpace = new Keyboard("Space");

    keySpace.press = () => {
      const easterEggTexture =
        PIXI.Loader.shared.resources["target_egg.png"].texture;
      const originalTexture =
        PIXI.Loader.shared.resources["target.png"].texture;

      // textures can be undefined, so we don't do anything if they are
      if (!easterEggTexture || !originalTexture) return;

      this.egg = !this.egg;

      if (this.egg) {
        this.scale.set(0.5);
        this.texture = easterEggTexture;
      } else {
        this.scale.set(0.15);
        this.texture = originalTexture;
      }
    };
  }
}
