import * as PIXI from "pixi.js";

interface KeyboardKey {
  value: string;
  isUp: boolean;
  isDown: boolean;
  press?: any;
  release?: any;
  upHandler?: (event: KeyboardEvent) => void;
  downHandler?: (event: KeyboardEvent) => void;
  unsubscribe?: () => void;
}

class Player extends PIXI.Sprite {
  vx: number;
  vy: number;

  constructor(app: PIXI.Application) {
    const texture = PIXI.Loader.shared.resources["mario.png"].texture;

    super(texture);

    this.vx = 0;
    this.vy = 0;

    this.anchor.set(0.5);
    this.scale.set(0.5);
    this.position.set(app.renderer.width / 2, app.renderer.height / 2);

    this.addMovement();

    // updating player on every tick
    app.ticker.add(() => this.update());
  }

  private update() {
    const newX = this.x + this.vx;
    if (newX > 0 && newX < app.renderer.width) {
      this.x += this.vx;
    }

    const newY = this.y + this.vy;
    if (newY > 0 && newY < app.renderer.height) {
      this.y += this.vy;
    }
  }

  // taken from https://github.com/kittykatattack/learningPixi#keyboard-movement
  private addMovement() {
    const keyW = keyboard("KeyW");
    const keyA = keyboard("KeyA");
    const keyS = keyboard("KeyS");
    const keyD = keyboard("KeyD");

    let egg = false;

    // Up
    keyW.press = () => {
      this.vx = 0;
      this.vy = -5;
    };
    keyW.release = () => {
      if (!keyS.isDown && this.vx === 0) {
        this.vy = 0;
      }
    };

    // Down
    keyS.press = () => {
      this.vx = 0;
      this.vy = 5;
    };
    keyS.release = () => {
      if (!keyW.isDown && this.vx === 0) {
        this.vy = 0;
      }
    };

    // Left
    keyA.press = () => {
      this.vx = -5;
      this.vy = 0;

      if (egg) {
        this.scale.x = -0.25;
      } else {
        this.scale.x = -0.5;
      }
    };
    keyA.release = () => {
      if (!keyD.isDown && this.vy === 0) {
        this.vx = 0;
      }
    };

    // Right
    keyD.press = () => {
      this.vx = 5;
      this.vy = 0;

      if (egg) {
        this.scale.x = 0.25;
      } else {
        this.scale.x = 0.5;
      }
    };
    keyD.release = () => {
      if (!keyA.isDown && this.vy === 0) {
        this.vx = 0;
      }
    };

    const easterEgg = keyboard("Space");
    easterEgg.press = () => {
      const easterEggTexture = PIXI.Loader.shared.resources["easterEgg.png"]
        .texture as PIXI.Texture;
      const originalTexture = PIXI.Loader.shared.resources["mario.png"]
        .texture as PIXI.Texture;

      egg = !egg;

      if (egg) {
        this.scale.set(0.25);
        this.texture = easterEggTexture;
      } else {
        this.scale.set(0.5);
        this.texture = originalTexture;
      }
    };
  }
}

class Background extends PIXI.Sprite {
  constructor(app: PIXI.Application) {
    const texture = PIXI.Loader.shared.resources["background.png"].texture;

    super(texture);

    this.anchor.set(0.5);
    this.position.set(app.renderer.width / 2, app.renderer.height / 2);

    // works best on 1920x1080 resolution
    // for this assignment, it's good enough
    this.width = app.renderer.width;
    this.height = app.renderer.height;
  }
}

class ScoreTarget extends PIXI.Sprite {
  constructor() {
    const texture = PIXI.Loader.shared.resources["star.png"].texture;

    super(texture);

    this.anchor.set(0.5);
    this.scale.set(0.2);

    this.moveRandom();
  }

  // moves the target randomly within the renderer
  public moveRandom() {
    const x = Math.floor(Math.random() * app.renderer.width);
    const y = Math.floor(Math.random() * app.renderer.height);

    this.position.set(x, y);
  }
}

const app = new PIXI.Application();

document.getElementById("app")?.appendChild(app.view);

// make the application fullscreen
// https://github.com/kittykatattack/learningPixi#creating-the-pixi-application-and-stage
app.renderer.view.style.display = "block";
app.renderer.view.style.position = "absolute";
app.resizeTo = window;

// loading images into a texture cache, to improve performance
// https://github.com/kittykatattack/learningPixi#loading-images-into-the-texture-cache
PIXI.Loader.shared
  .add("mario.png")
  .add("easterEgg.png")
  .add("background.png")
  .add("star.png")
  .load(setup);

let score = 0;
let player: Player;
let background: Background;
let scoreTarget: ScoreTarget;

const scoreElement = document.getElementById("score") as HTMLElement;
const tutorialElement = document.getElementById("tutorial") as HTMLElement;

const scoreAudio = document.createElement("audio");
scoreAudio.setAttribute("src", "score.mp3");

const musicAudio = document.createElement("audio");
musicAudio.setAttribute("src", "music.mp3");
musicAudio.setAttribute("autoplay", "autoplay");
musicAudio.addEventListener(
  "ended",
  function () {
    this.currentTime = 0;
    this.play();
  },
  false
);

// "dirty" hack for playing the music automatically after page loaded, user needs to interact with document first
// otherwise we get this error:
// DOMException: play() failed because the user didn't interact with the document first.
window.addEventListener("keydown", () => {
  if (musicAudio.paused) {
    musicAudio.play();
  }
});

function setup() {
  player = new Player(app);
  background = new Background(app);
  scoreTarget = new ScoreTarget();

  app.stage.addChild(background);
  app.stage.addChild(player);
  app.stage.addChild(scoreTarget);

  scoreElement.style.visibility = "visible";
  tutorialElement.style.visibility = "visible";

  app.ticker.add(() => {
    if (detectCollision(player, scoreTarget)) {
      score++;
      scoreAudio.play();
      scoreElement.innerHTML = `Score: ${score}`;

      scoreTarget.moveRandom();
    }
  });
}

// taken from https://github.com/kittykatattack/learningPixi#keyboard-movement
// no need to re-invent the wheel :) just add types to it :D
function keyboard(value: string): KeyboardKey {
  const key: KeyboardKey = {
    value: value,
    isUp: true,
    isDown: false,
  };

  key.downHandler = (event: KeyboardEvent) => {
    if (event.code === key.value) {
      if (key.isUp && key.press) {
        key.press();
      }

      key.isUp = false;
      key.isDown = true;

      event.preventDefault();
    }
  };

  key.upHandler = (event: KeyboardEvent) => {
    if (event.code === key.value) {
      if (key.isDown && key.release) {
        key.release();
      }

      key.isUp = true;
      key.isDown = false;

      event.preventDefault();
    }
  };

  const upListener = key.upHandler.bind(key);
  const downListener = key.downHandler.bind(key);

  window.addEventListener("keyup", upListener, false);
  window.addEventListener("keydown", downListener, false);

  key.unsubscribe = () => {
    window.removeEventListener("keyup", upListener);
    window.removeEventListener("keydown", downListener);
  };

  return key;
}

// taken from https://github.com/kittykatattack/learningPixi#the-hittestrectangle-function
function detectCollision(r1: any, r2: any) {
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  hit = false;

  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  if (Math.abs(vx) < combinedHalfWidths) {
    if (Math.abs(vy) < combinedHalfHeights) {
      hit = true;
    } else {
      hit = false;
    }
  } else {
    hit = false;
  }

  return hit;
}

app.start();
