import * as PIXI from 'pixi.js';
import World from './World';
import * as planck from 'planck-js';

class Game {
    constructor() {
        PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH; // Big hack for fxaa
        planck.internal.Settings.velocityThreshold = 0.1; // Bounce
        this.app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight, transparent: false });
        this.app.renderer.autoResize = true;
        this.resizeBus = [
            () => this.app.renderer.resize(window.innerWidth, window.innerHeight)
        ]
        window.onresize = () => this.resize();
        this.world = new World(this);
    }

    injectPixiContext(element) {
        if (element && element.children.length <= 0) {
            element.appendChild(this.app.view);
            PIXI.loader.add("particle", "particle.png").load(() => this.initializeRender());
        }
    }

    initializeRender() {
        this.world.init();
        this.app.ticker.add(delta => this.tick(delta));
        this.app.stage.filters = [new PIXI.filters.FXAAFilter()];
    }

    tick(delta) {
        this.world.tick(delta);
    }

    resize() {
        for (let handler of this.resizeBus) {
            handler();
        }
    }
}

export default Game;