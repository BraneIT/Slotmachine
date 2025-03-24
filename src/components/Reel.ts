import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { ConfigInterface } from "../config/ConfigInterface";


export class Reel extends PIXI.Container {
    private static ticker: PIXI.Ticker;

    private config!: ConfigInterface;
    private maskContainer: PIXI.Graphics = new PIXI.Graphics();
    private symbols: PIXI.Sprite[] = [];
    private slotTextures: PIXI.Texture[] = [];
    private reelSymbols: number[] = [];

    private spinSpeed: number = 0;
    private spinDuration: number = 0;
    private spinElapsedTime: number = 0;
    private spinning: boolean = false;
    private stopping: boolean = false;
    public ready: Promise<void>;
    private resolveReady!: () => void;

    public static setTicker(ticker: PIXI.Ticker) {
        Reel.ticker = ticker;
    }

    constructor(config: ConfigInterface, reelSymbols: number[]) {
        super();
        this.config = config;
        this.reelSymbols = reelSymbols;
        this.ready = new Promise(resolve => (this.resolveReady = resolve));

        this.init().then(() => {
            this.createSymbols();
            this.createMask();
            this.resolveReady();
        });

        Reel.ticker.add(this.update, this);
    }

    private async init(): Promise<void> {
        const assetPaths = [
            "assets/bbry.png",
            "assets/cola.png",
            "assets/dice.png",
            "assets/llp.png",
            "assets/mal.png",
            "assets/sea.png",
            "assets/7.png"
        ];

        await PIXI.Assets.load(assetPaths);
        this.slotTextures = assetPaths.map(path => PIXI.Texture.from(path));
    }

    private createSymbols(): void {
        const { symbolHeight, numberOfRows } = this.config;

        for (let i = 0; i < numberOfRows + 1; i++) {
            const symbolIndex = this.reelSymbols[i % this.reelSymbols.length];
            const texture = this.slotTextures[symbolIndex];
            const sprite = new PIXI.Sprite(texture);
            sprite.y = i * symbolHeight;
            sprite.width = this.config.reelWidth;
            sprite.height = symbolHeight;
            this.symbols.push(sprite);
            this.addChild(sprite);
        }
    }

    private createMask(): void {
        const { reelWidth, numberOfRows, symbolHeight } = this.config;
        this.maskContainer.fill(0x000000);
        this.maskContainer.roundRect(0, 0, reelWidth, numberOfRows * symbolHeight);
        this.maskContainer.fill();
        this.addChild(this.maskContainer);
        this.mask = this.maskContainer;
    }

    public setSymbols(newSymbols: number[]) {
        this.reelSymbols = newSymbols;
    }

    public spin(spinSpeed: number, spinDuration: number): void {
        this.spinSpeed = spinSpeed;
        this.spinDuration = spinDuration;
        this.spinElapsedTime = 0;
        this.spinning = true;
        this.stopping = false;
    }

    public stop(): void {
        this.stopping = true;
    }

    private update(ticker: PIXI.Ticker): void {
        if (!this.spinning) return;
    
        const { symbolHeight, numberOfRows } = this.config;
    
        const delta = Math.min(ticker.deltaTime, 3);
        const speed = this.spinSpeed * delta;
    
        for (const sprite of this.symbols) {
            sprite.y += speed;
        }
    
        for (let i = 0; i < this.symbols.length; i++) {
            if (this.symbols[i].y >= (numberOfRows + 1) * symbolHeight) {
                this.symbols[i].y = this.getTopY() - symbolHeight;
    
                const symbolIndex = Math.floor(Math.random() * this.slotTextures.length);
                this.symbols[i].texture = this.slotTextures[symbolIndex];
            }
        }
    
        this.spinElapsedTime += ticker.deltaMS;
    
        if (this.stopping && this.spinElapsedTime >= this.spinDuration) {
            this.finishSpin();
        }
    }

    private finishSpin() {
        this.spinning = false;
        this.stopping = false;

        const { symbolHeight } = this.config;

        this.symbols.sort((a, b) => a.y - b.y);

        for (let i = 0; i < this.config.numberOfRows + 1; i++) {
            const symbolIndex = this.reelSymbols[i % this.reelSymbols.length];
            this.symbols[i].texture = this.slotTextures[symbolIndex];
        }

        for (let i = 0; i < this.symbols.length; i++) {
            gsap.to(this.symbols[i], {
                y: i * symbolHeight,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }

    private getTopY(): number {
        return Math.min(...this.symbols.map(s => s.y));
    }
}
