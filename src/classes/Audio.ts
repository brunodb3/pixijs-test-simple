export default class Audio {
  element: HTMLAudioElement;

  constructor(file: string) {
    this.element = document.createElement("audio");

    this.element.setAttribute("src", file);
  }

  public isPaused(): boolean {
    return this.element.paused;
  }

  public play(): void {
    this.element.play();
  }

  public mute(): void {
    this.element.muted = true;
  }

  public unmute(): void {
    this.element.muted = false;
  }

  public autoplay(): void {
    this.element.setAttribute("autoplay", "autoplay");
    this.element.addEventListener(
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
      if (this.isPaused()) {
        this.play();
      }
    });
  }
}
