# Assignment Workflow

Here you can find the steps I took for this assignment, to highlight my workflow.

## 1. Go to pixijs.com and read some docs

The first step is to read the documentation for the framework I'll be working with. So I spent a few minutes on https://pixijs.io/guides/ and https://pixijs.io/examples/, to get a bit familiar with PixiJS.

## 2. Run the project

Looking through the project files, I see Pixi is already installed and a project is already started. So let's run it and see what happens!

```bash
$ yarn install
$ yarn dev
```

This opens Vite (didn't know about this tool, pretty nice! Easier to setup than webpack) and I see no errors anywhere. So far, so good.

## 3. Get Mario on the screen

After going through the docs a bit, I see that to render an image on the canvas, Pixi uses `Sprites`. So let's do that.

```typescript
// src/main.ts
import * as PIXI from "pixi.js";

const application = new PIXI.Application();

const mario = PIXI.Sprite.from("mario.png");

application.stage.addChild(mario);

document.getElementById("app")?.appendChild(application.view);

application.ticker.add((delta: number) => {});

application.start();
```

We now have a Mario on the screen. Super.

## 4. I like to move it, move it

Next, I want to move Mario. This "ticker" concept is new to me, but it seems to run every frame.

```typescript
application.ticker.add((delta: number) => {
  // this will move Mario to the right of the view
  // -160 for the image's width
  if (mario.x < application.view.width - 160) {
    mario.x += 1;
  }
});
```

## 5. I control the movement

Let's move Mario with our own inputs this time. I know there's a `window.addEventListener('keydown')`, so let's try that.

```typescript
mario.x = 0;

// I use keydown because keypress only triggers once if you hold the key
window.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.code === "KeyD") {
    mario.x += 10;
  }

  if (event.code === "KeyA") {
    mario.x -= 10;
  }
});

application.ticker.add((delta: number) => {});
```

That didn't work... Mario doesn't move. Until I remembered about the ticker, which is triggered on every frame. Of course, I need to update Mario's positions on every frame!

```typescript
application.ticker.add((delta: number) => {
  mario.x = mario.x;
});
```

And boom! It works! But the movement is not smooth at all, and I don't really like the code. Time for some more research...

## 6. Optimizing the movement

After some quick Google searches, I found a pretty nice and in-depth tutorial for Pixi, [by kittykatattack](https://github.com/kittykatattack/learningPixi). It even includes keyboard movements, which is what we're looking for here! So, let's implement some of this stuff!

```typescript
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
```

The first thing was to create the `keyboard` function, which returns a `key` object that we can later use for listening to keys. I didn't change much from what I found on the [GitHub page](https://github.com/kittykatattack/learningPixi#keyboard-movement).

Next, I created a `Player` class, to make things a bit easier to manage. The movement part was also taken from the same GitHub page (it's not the best, as there's no diagonal movement. But I'm not worried about that for now).

```typescript
class Player extends PIXI.Sprite {
  vx: number;
  vy: number;

  constructor(app: PIXI.Application) {
    const texture = PIXI.Loader.shared.resources["mario.png"].texture;

    super(texture);

    this.vx = 0;
    this.vy = 0;

    // anchor is the origin point of the sprite on the image. 0.5 is the center
    this.anchor.set(0.5);

    // setting position and scale
    this.position.set(app.renderer.width / 2, app.renderer.height / 2);
    this.scale.set(0.75);

    this.addMovement();

    // updating player on every tick
    app.ticker.add(() => this.update());
  }

  private update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  // taken from https://github.com/kittykatattack/learningPixi#keyboard-movement
  private addMovement() {
    const keyW = keyboard("KeyW");
    const keyA = keyboard("KeyA");
    const keyS = keyboard("KeyS");
    const keyD = keyboard("KeyD");

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
    };
    keyD.release = () => {
      if (!keyA.isDown && this.vy === 0) {
        this.vx = 0;
      }
    };
  }
}
```

Instead of moving the sprite directly, I'm using a velocity property, instead of changing the position directly, for a smoother movement "animation".

I also added a `setup()` and `gameLoop()` methods, along with a `PIXI.Loader` for optimizing texture performance. Taking a lot from that GitHub page :)

```typescript
PIXI.Loader.shared.add("mario.png").load(setup);

function setup() {
  player = new Player(app);

  app.stage.addChild(player);
}

function gameLoop(delta: number) {
  // happens every tick
}
```

To make Mario a Sprite that responds to input, all we need now is something like this:

```typescript
player = new Player();
```

And now Mario can move with `WASD` movement!

## 7. Extra credit

I could already be done with this assignment, but I'm having fun, so let's go for extra credit :)

The idea is to make a little "game" where the player (as Mario) will chase a star. Everytime the player reaches the star, 1 point is added to the score, and the star moves somewhere else.

### 7.1 Setting the stage

For this, I wanted it to look like a Mario game. So I grabbed an image from the internet for the background, and made it a fullscreen sprite. I haven't tested responsiveness with other devices, but I think that would be going too far. For now, I'll just worry about what works on a 1920x1080 screen.

```typescript
// creating a class for the background sprite
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

// make the application fullscreen
// https://github.com/kittykatattack/learningPixi#creating-the-pixi-application-and-stage
app.renderer.view.style.display = "block";
app.renderer.view.style.position = "absolute";
app.resizeTo = window;

// loading images into a texture cache, to improve performance
// https://github.com/kittykatattack/learningPixi#loading-images-into-the-texture-cache
PIXI.Loader.shared.add("mario.png").add("background.png").load(setup);

let background: Background;

function setup() {
  /* ... */
  background = new Background(app);

  // add the background first, then the player (haven't looked at how to properly layer sprites yet)
  app.stage.addChild(background);
  app.stage.addChild(player);
  /* ... */
}
```

I also needed to add a little bit of CSS to the `index.html` (not worrying about making CSS files for now, inline `style` is fine).

```html
<style>
  /* removing padding and marging to make renderer fullscreen */
  * {
    padding: 0;
    margin: 0;
  }
</style>
```

### 7.2 Adding the star

I grabbed a random `star.png` from the internet to use as my scoring target. Then I created a class for it:

```typescript
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
```

## 7.3 Collision detection

Then, I wanted to have collision detection between the player and the target, so that everytime they collide, a score is added and the target moves. I grabbed some code from our trusty GitHub page, which just creates a "virtual rectangle" on the sprites and checks for the positional values of two sprites to see if the rectangles are occupying the same space.

I could make this look better and implement it into the `ScoreTarget` class itself, but I didn't want to spend too much time on it, so I just used as-is.

```typescript
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

function setup() {
  /* ... */
  app.ticker.add(() => {
    if (detectCollision(player, scoreTarget)) {
      // score!!!
      scoreTarget.moveRandom();
    }
  });
  /* ... */
}
```

## 7.4 A few extras

At this point I did some polishing of the code, to make things a bit better, added a score counter (as a DOM element with a custom Google font) and some sound effects. You can see the final result on `main.ts`.

I added a `classes` folder with files for each class (Audio, Player, Text). It's not a super complex structure, but it does help get some clutter off of `main.ts`. I also changed a bit the movement, allowing for diagonal movement. It's not perfect, but it's so much better being able to move diagonally :) I'm not going to highlight all the changes here, because you can just navigate the repository to see what the final version looks like.

I also added an easter egg, can you find it? :)

## Bruno Duarte Brito - January 2022
