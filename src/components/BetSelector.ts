import * as PIXI from "pixi.js";
import { ConfigInterface } from "../config/ConfigInterface";

export class BetSelector extends PIXI.Container {
    private betAmounts: number[];
    private currentIndex: number = 0;
    private mainButton: PIXI.Container;
    private betDisplayText!: PIXI.Text;
    private plusButton!: PIXI.Text;
    private minusButton!: PIXI.Text;
    private popup!: PIXI.Container;
    private popupOpen: boolean = false;
    private popupWidth: number;
    private popupHeight: number;
    private readonly style: Partial<PIXI.TextStyle> = {
        fill: 0xffffff,
        fontSize: 24
    };

    private readonly buttonWidth = 200;
    private readonly buttonHeight = 60;

    constructor(
        betAmounts: number[],
        config: ConfigInterface
    ) {
        super();
        this.betAmounts = betAmounts;
        this.popupWidth = config.betListWidth;
        this.popupHeight = config.betListHeight;

        this.mainButton = this.createMainButton();
        this.popup = this.createPopupList();

        this.addChild(this.mainButton);
    }

    private createMainButton(): PIXI.Container {
        const container = new PIXI.Container();

        // Background
        const bg = new PIXI.Graphics();
        bg.beginFill(0x333333);
        bg.drawRoundedRect(0, 0, this.buttonWidth, this.buttonHeight, 10);
        bg.endFill();
        container.addChild(bg);

        // Minus button
        this.minusButton = new PIXI.Text("–", this.style);
        this.minusButton.interactive = true;
        this.minusButton.cursor = "pointer";
        this.minusButton.on("pointerdown", () => this.adjustBet(-1));
        container.addChild(this.minusButton);

        // Plus button
        this.plusButton = new PIXI.Text("+", this.style);
        this.plusButton.interactive = true;
        this.plusButton.cursor = "pointer";
        this.plusButton.on("pointerdown", () => this.adjustBet(1));
        container.addChild(this.plusButton);

        // Bet display text
        this.betDisplayText = new PIXI.Text("", this.style);
        this.betDisplayText.interactive = true;
        this.betDisplayText.cursor = "pointer";
        this.betDisplayText.on("pointerdown", () => this.togglePopup());
        container.addChild(this.betDisplayText);

        // Position elements
        this.layoutMainButton();

        return container;
    }

    private layoutMainButton() {
        this.betDisplayText.text = `BET: ${this.betAmounts[this.currentIndex]}`;

        this.betDisplayText.x = (this.buttonWidth - this.betDisplayText.width) / 2;
        this.betDisplayText.y = (this.buttonHeight - this.betDisplayText.height) / 2;

        this.minusButton.x = 10;
        this.minusButton.y = (this.buttonHeight - this.minusButton.height) / 2;

        this.plusButton.x = this.buttonWidth - this.plusButton.width - 10;
        this.plusButton.y = (this.buttonHeight - this.plusButton.height) / 2;
    }

    private adjustBet(direction: number) {
        const newIndex = this.currentIndex + direction;
        if (newIndex >= 0 && newIndex < this.betAmounts.length) {
            this.currentIndex = newIndex;
            this.layoutMainButton();
            if (this.popupOpen) {
                this.updatePopupHighlight();
            }
        }
    }

    private togglePopup() {
        if (this.popupOpen) {
            this.removeChild(this.popup);
        } else {
            this.addChild(this.popup);
            this.updatePopupHighlight();
        }
        this.popupOpen = !this.popupOpen;
    }

    private createPopupList(): PIXI.Container {
        const container = new PIXI.Container();
        const spacing = 10;

        container.y = -this.popupHeight - spacing;

        const bg = new PIXI.Graphics();
        bg.beginFill(0x222222);
        bg.drawRoundedRect(0, 0, this.popupWidth, this.popupHeight, 8);
        bg.endFill();
        container.addChild(bg);

        const mask = new PIXI.Graphics();
        mask.beginFill(0x000000);
        mask.drawRect(0, 0, this.popupWidth, this.popupHeight);
        mask.endFill();
        container.mask = mask;
        container.addChild(mask);

        const scrollContainer = new PIXI.Container();
        container.addChild(scrollContainer);

        const itemHeight = 40;

        for (let i = 0; i < this.betAmounts.length; i++) {
            const amount = this.betAmounts[i];
            const item = new PIXI.Text(amount.toString(), this.style);
            item.y = i * itemHeight;
            item.x = 10;
            item.interactive = true;
            item.cursor = "pointer";

            item.on("pointerdown", () => {
                this.currentIndex = i;
                this.layoutMainButton();
                this.togglePopup();
            });

            scrollContainer.addChild(item);
        }

        scrollContainer.y = 0;

        container.interactive = true;
        container.on("wheel", (e: WheelEvent) => {
            scrollContainer.y += e.deltaY * -0.5;
            const maxScroll = 0;
            const minScroll = Math.min(this.popupHeight - scrollContainer.height, 0);
            scrollContainer.y = Math.max(minScroll, Math.min(maxScroll, scrollContainer.y));
        });

        return container;
    }

    private updatePopupHighlight() {
        const items = this.popup.children[1].children as PIXI.Text[];
        items.forEach((item, index) => {
            item.style = {
                ...this.style,
                fill: index === this.currentIndex ? 0xffff00 : 0xffffff
            };
        });
    }

    public getCurrentBet(): number {
        return this.betAmounts[this.currentIndex];
    }
}
