import { Application } from "pixi.js";
import { config } from "./config/Config";
import { SlotFace } from "./components/SlotFace";
import { Button } from "./components/PlayButton";
import { Reel } from "./components/Reel";
import { BetSelector } from "./components/BetSelector";

(async () => {
    const app = new Application();
    await app.init({
        background: "#FFFDE7",
        width:  200 +(config.numberOfReels * config.reelWidth),
        height: 200 + (config.numberOfRows * config.symbolHeight),
    });

    app.view.style.borderRadius = "50px";

    document.getElementById("pixi-container")!.appendChild(app.canvas);

    Reel.setTicker(app.ticker);

    const placeholderData: number[][] = Array.from({ length: config.numberOfReels }, () =>
        Array.from({ length: config.numberOfRows }, () => 0)
    );
    const slotFace = new SlotFace(config, placeholderData);
    slotFace.y = 50;
    app.stage.addChild(slotFace);

    const spinButton = new Button(100, 60, "SPIN", () => {
        const reelsData: number[][] = [];
        for (let i = 0; i < config.numberOfReels; i++) {
            const reelSymbols: number[] = [];
            for (let j = 0; j < config.numberOfRows; j++) {
                reelSymbols.push(Math.floor(Math.random() * config.slotTexturesNumber));
            }
            reelsData.push(reelSymbols);
        }
        slotFace.spin(config.spinSpeed, config.spinDuration, reelsData);
    });

    spinButton.x = (app.screen.width - 100) / 2;
    spinButton.y = app.screen.height - 100;
    app.stage.addChild(spinButton);

    const betSelector = new BetSelector(config.bets, config);

    betSelector.x = (app.screen.width - 300);
    betSelector.y = app.screen.height - 100;
    app.stage.addChild(betSelector);
})();