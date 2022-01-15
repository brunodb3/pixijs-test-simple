import * as PIXI from "pixi.js";

import Keyboard from "./Keyboard";

export default class Background extends PIXI.Sprite {
  private egg: boolean = false;

  private app: PIXI.Application;

  constructor(app: PIXI.Application) {
    const texture = PIXI.Loader.shared.resources["background.png"].texture;

    super(texture);

    this.app = app;

    this.anchor.set(0.5);
    this.position.set(app.renderer.width / 2, app.renderer.height / 2);

    this.easterEgg();

    this.app.ticker.add(() => this.update());
  }

  private update() {
    // works best on 1920x1080 resolution
    // for this assignment, it's good enough
    this.width = this.app.renderer.width;
    this.height = this.app.renderer.height;
  }

  private easterEgg() {
    const keySpace = new Keyboard("Space");

    keySpace.press = () => {
      const easterEggTexture =
        PIXI.Loader.shared.resources["background_egg.png"].texture;
      const originalTexture =
        PIXI.Loader.shared.resources["background.png"].texture;

      // textures can be undefined, so we don't do anything if they are
      if (!easterEggTexture || !originalTexture) return;

      this.egg = !this.egg;

      if (this.egg) {
        this.texture = easterEggTexture;
      } else {
        this.texture = originalTexture;
      }
    };
  }
}
