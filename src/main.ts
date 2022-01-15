import * as PIXI from "pixi.js";

import Player from "./classes/Player";
import Background from "./classes/Background";
import ScoreTarget from "./classes/ScoreTarget";
import Audio from "./classes/Audio";
import Text from "./classes/Text";
import Keyboard from "./classes/Keyboard";

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
  .add("player.png")
  .add("player_egg.png")
  .add("background.png")
  .add("background_egg.png")
  .add("target.png")
  .add("target_egg.png")
  .load(setup);

let score = 0;
let egg: boolean = false;

let player: Player;
let background: Background;
let scoreTarget: ScoreTarget;

const scoreText = new Text("h2", "Score: 0");
const tutorialText = new Text(
  "p",
  "Catch the star! <br> Use WASD or arrow keys to move"
);

const scoreAudio = new Audio("score.mp3");
const musicAudio = new Audio("music.mp3");
musicAudio.autoplay();

const scoreEggAudio = new Audio("score_egg.mp3");
const easterEggMusicAudio = new Audio("music_egg.mp3");
easterEggMusicAudio.mute();
easterEggMusicAudio.autoplay();

function setup() {
  player = new Player(app);
  background = new Background(app);
  scoreTarget = new ScoreTarget(app);

  app.stage.addChild(background);
  app.stage.addChild(player);
  app.stage.addChild(scoreTarget);

  easterEgg();

  app.ticker.add(() => {
    if (detectCollision(player, scoreTarget)) {
      score++;

      if (egg) {
        scoreEggAudio.play();
      } else {
        scoreAudio.play();
      }

      scoreText.setValue(`Score: ${score}`);

      scoreTarget.moveRandom();
    }
  });
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

function easterEgg() {
  const keySpace = new Keyboard("Space");

  keySpace.press = () => {
    egg = !egg;

    if (egg) {
      musicAudio.mute();
      easterEggMusicAudio.unmute();

      tutorialText.setValue(
        "Catch the jellyfish! <br> Use WASD or arrow keys to move"
      );
    } else {
      tutorialText.setValue(
        "Catch the star! <br> Use WASD or arrow keys to move"
      );

      musicAudio.unmute();
      easterEggMusicAudio.mute();
    }
  };
}

app.start();
