import * as PIXI from "pixi.js";

export class Button extends PIXI.Container {
    private textLabel: PIXI.Text;

    constructor(width: number, height: number, text: string, onClick: () => void) {
        super();

        const background = new PIXI.Graphics();
        background.fill("#672225");
        background.roundRect(0, 0, width, height, 10);
        background.fill();
        this.addChild(background);

        this.textLabel = new PIXI.Text({
            text: text,
            style: {
              fontFamily: "Arial",
              fontSize: 24,
              fill: 0xffffff,
              align: "center",
            },
          });

        this.textLabel.x = (width - this.textLabel.width) / 2;
        this.textLabel.y = (height - this.textLabel.height) / 2;
        
        this.addChild(this.textLabel);

        this.eventMode = 'static'; 
        this.cursor = 'pointer';   
        this.on("pointerdown", onClick);
    }
}