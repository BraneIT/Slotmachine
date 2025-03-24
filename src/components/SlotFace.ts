import { Reel } from "./Reel";
import { ConfigInterface } from "../config/ConfigInterface";
import * as PIXI from "pixi.js";

export class SlotFace extends PIXI.Container {
    protected reels: Reel[] = [];
    protected running: boolean = false;
    protected spinning: boolean = false;
    

    constructor(config: ConfigInterface, reelsData: number[][]) {
        super();
        this.createReels(config, reelsData);
    }

    private createReels(config: ConfigInterface, reelsData: number[][]) {
        
    
        const totalReelsWidth = config.numberOfReels * config.reelWidth + (config.numberOfReels - 1) * config.spacing;
        const gameWidth = 200 + (config.numberOfReels * config.reelWidth);
    
        const startX = (gameWidth - totalReelsWidth) / 2;
    
        for (let i = 0; i < config.numberOfReels; i++) {
            const reel = new Reel(config, reelsData[i]);
    
            reel.x = startX + i * (config.reelWidth + config.spacing);
    
            this.reels.push(reel);
            this.addChild(reel);
        }
    }


    public async spin(spinSpeed: number, spinDuration: number, reelsData: number[][]) {
        this.spinning = true;
        this.running = true;

        await Promise.all(this.reels.map(reel => reel.ready));

        this.reels.forEach((reel, index) => {
            reel.setSymbols(reelsData[index]);

            setTimeout(() => {
                reel.spin(spinSpeed, spinDuration);
            }, index * 100); 
        });

        const totalSpinTime = spinDuration + (this.reels.length - 1) * 100;
        setTimeout(() => {
            this.stopReels();
        }, totalSpinTime);
    }


    private stopReels() {
        this.reels.forEach((reel, index) => {
            setTimeout(() => {
                reel.stop();

                if (index === this.reels.length - 1) {
                    setTimeout(() => {
                        this.spinning = false;
                        this.running = false;
                        console.log("Spin complete");
                    }, 500);
                }
            }, index * 100);
        });
    }
}
