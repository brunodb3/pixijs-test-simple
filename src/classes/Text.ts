export default class Text {
  private element: HTMLHeadingElement | HTMLParagraphElement;

  constructor(tag: "h2" | "p", value?: string) {
    this.element = document.createElement(tag);

    document.getElementById("app")?.appendChild(this.element);

    this.element.style.color = "white";
    this.element.style.zIndex = "1000";
    this.element.style.display = "block";
    this.element.style.position = "absolute";
    this.element.style.textTransform = "uppercase";
    this.element.style.webkitTextStroke = "2px black";
    this.element.style.fontFamily = "Mochiy Pop P One";

    if (tag === "h2") {
      this.element.style.fontSize = "34pt";
      this.setPosition("20px", "100px");
    }

    if (tag === "p") {
      this.element.style.fontSize = "24pt";
      this.setPosition("80px", "100px");
    }

    if (value) {
      this.setValue(value);
    }
  }

  public setValue(value: string) {
    this.element.innerHTML = value;
  }

  public setPosition(top: string, left: string) {
    this.element.style.marginTop = top;
    this.element.style.marginLeft = left;
  }
}
