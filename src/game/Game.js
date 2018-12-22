import * as PIXI from 'pixi.js';
import * as PIXIFilters from 'pixi-filters';
import World from './World';
import * as planck from 'planck-js';
import Resources from './Resources'
import Sprites from './assets/sprites/Sprites'
import testlevel from './assets/levels/Test'
import Editor from './Editor';
import * as util from './util/Util';
import Point from './Point';
import Levels from './assets/levels/Levels';

class Game {
    constructor() {
        PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH; // Big hack for fxaa
        planck.internal.Settings.velocityThreshold = 0.1; // Bounce
        this.app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight, transparent: false });
        this.editor = false;
        this.ready = false;
        this.app.renderer.autoResize = true;
        this.resizeBus = [
            () => this.app.renderer.resize(window.innerWidth, window.innerHeight)
        ]
        window.onresize = () => this.resize();
        this.level = Levels.getLevel("test");
        util.keyboard("e").press = () => {
            let position = null;
            if (this.editor) {
                position = new Point(this.content.x, this.content.y);
            } else {
                position = new Point(this.content.player.sprite.x, this.content.player.sprite.y);
            }
            this.editor = !this.editor;
            this.loading.x = position.x - (this.loading.width / 2);
            this.loading.y = position.y - (this.loading.height / 2);
            this.app.stage.addChild(this.loading);
            this.app.render();
            setTimeout(() => {
                for (let texture of this.content.getGeneratedTextures()) {
                    //console.log("destyoyed: " + texture)
                    texture.destroy(true);
                }
                while (this.app.stage.children.length > 0) {
                    this.app.stage.removeChild(this.app.stage.getChildAt(0));
                }
                this.createContent();
                if (this.editor) {
                    this.content.x = position.x;
                    this.content.y = position.y;
                } else {
                    this.content.initialPlayerPosition = position;
                }
                this.initializeRender();
            }, 10);

        }
        util.keyboard("p").press = () => {
            console.log(Levels.levelToString(this.level));
        }
        this.createContent();
        this.app.ticker.add(delta => this.tick(delta));
    }

    createContent() {
        this.ready = false;
        if (this.editor) {
            this.content = new Editor(this);
        } else {
            this.content = new World(this);
        }
    }

    init(callback) {
        this.callback = callback;
        const loader = PIXI.loader;
        for (const resource of Resources.getResources()) {
            loader.add(resource.name, resource.path);
        }
        this.callback(false, "Loading resources...");
        loader.on('progress', (loader, res) => {
            this.callback(false, "Loading resources... (" + Math.round(loader.progress) + "%)");
        });
        loader.load(() => this.loadSprites());
    }

    injectPixiContext(element) {
        if (element && element.children.length <= 0) {
            element.appendChild(this.app.view);
        }
    }

    loadSprites() {
        this.callback(false, "Generating textures...");
        this.loading = new PIXI.Sprite(Resources.getResource(Resources.loaded.loading).texture);
        Sprites.init(() => this.buildWorld());
    }

    buildWorld() {
        this.callback(false, "Building world...");
        setTimeout(() => {
            this.initializeRender();
        }, 100);
    }

    initializeRender() {
        this.content.init();
        this.app.stage.filters = [new PIXI.filters.FXAAFilter()];
        this.ready = true;
        this.callback(true, "Done!");
    }

    tick(delta) {
        if (this.ready) {
            this.content.tick(delta);
        }
    }

    resize() {
        for (let handler of this.resizeBus) {
            handler();
        }
    }
}

export default Game;