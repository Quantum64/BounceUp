import * as PIXI from 'pixi.js';
import Point from './Point';
import * as util from './util/Util';
import * as shaders from './assets/shaders/Shaders';
import Sprites from './assets/sprites/Sprites'
import Levels from './assets/levels/Levels'

class Editor {
    constructor(game) {
        this.definitions = game.level.definitions;
        this.game = game;
        this.level = game.level;
        this.app = this.game.app;
        this.objects = [];
        this.generated = [];

        const center = util.getScreenCenter();
        this.x = center.x;
        this.y = center.y;
    }

    init() {
        this.game.resizeBus.push(() => {
            this.background.clear();
            this.background.beginFill(0x111111);
            this.background.drawRect(0, 0, this.app.renderer.width + 20, this.app.renderer.height + 20);
        });

        // Generate stage textures
        for (const key in this.definitions) {
            const definition = this.definitions[key];
            definition.texture = this.bakeStageTexture({
                name: key,
                points: definition.points.map(point => new Point(point[0], point[1])),
                colors: definition.colors
            });
        }

        // Background
        this.backgroundShader = shaders.sky();
        this.background = new PIXI.Graphics();
        this.background.beginFill(0x111111);
        this.background.drawRect(0, 0, this.app.renderer.width + 20, this.app.renderer.height + 20);
        this.background.filters = [this.backgroundShader.shader]
        this.app.stage.addChild(this.background);
        this.app.stage.interactive = true;
        this.app.stage.mousedown = (event) => {
            this.app.stage.dragging = true;
            this.app.stage.startx = event.data.global.x + this.x;
            this.app.stage.starty = event.data.global.y + this.y;
        }
        this.app.stage.mousemove = (event) => {
            if (this.app.stage.dragging) {
                this.x = this.app.stage.startx - event.data.global.x;
                this.y = this.app.stage.starty - event.data.global.y;
            }
        }
        this.app.stage.mouseup = (event) => {
            this.app.stage.dragging = false;
        }
        this.app.stage.mouseupoutside = (event) => {
            this.app.stage.dragging = false;
        }

        for (const object of this.level.objects) {
            this.addStageObject(object.x, object.y * -1, this.definitions[object.name]).component = object;
        }
        for (const sprite of this.level.sprites) {
            const scale = sprite.scale === undefined ? 1 : sprite.scale;
            this.addSprite(sprite.x, sprite.y * -1, sprite.sheet, sprite.name, scale).component = sprite;
        }

        this.createPlayer();
    }

    tick(delta) {
        const center = util.getScreenCenter();
        this.app.stage.position.set(center.x - this.x, center.y - this.y);
        this.background.x = this.x - center.x - 10;
        this.background.y = this.y - center.y - 10;

        this.player.sprite.x = this.x;
        this.player.sprite.y = this.y;
    }

    createPlayer() {
        const playerSize = 10;
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xff0000);
        graphics.drawCircle(0, 0, playerSize);
        const texture = this.app.renderer.generateTexture(graphics);
        this.generated.push(texture);
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.x = this.x;
        sprite.y = this.y;
        this.app.stage.addChild(sprite);

        this.player = {
            sprite: sprite
        }
    }

    bakeStageTexture(def) {
        const points = def.points;
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0x000000);
        graphics.drawPolygon(points.map(point => point.multiply(1, 1).toPixiPoint()));
        graphics.endFill();
        const bounds = graphics.getBounds();
        const container = new PIXI.Container();
        const textures = [];

        const texture = new PIXI.Graphics();
        texture.beginFill(0xffffff);
        texture.drawPolygon(points.map(point => point.toPixiPoint()));
        texture.endFill();
        const shape = texture.getBounds();
        const tex = this.app.renderer.generateTexture(texture);
        textures.push(tex);
        const sprite = new PIXI.Sprite(tex);
        sprite.blendMode = PIXI.BLEND_MODES.ADD;
        sprite.x = shape.x;
        sprite.y = shape.y;
        container.addChild(sprite);
        const render = new PIXI.RenderTexture(new PIXI.BaseRenderTexture(bounds.width + bounds.x, bounds.height + bounds.y, PIXI.SCALE_MODES.LINEAR, 1));
        this.app.renderer.render(container, render);
        for (const texture of textures) {
            texture.destroy(true);
        }
        this.generated.push(render);

        return render;
    }

    addStageObject(x, y, definition) {
        // Graphics
        const sprite = new PIXI.Sprite(definition.texture);
        sprite.x = x;
        sprite.y = y;
        sprite.scale.x = 1;
        sprite.scale.y = 1;
        this.app.stage.addChild(sprite);

        const object = {
            sprite: sprite
        };
        this.makeInteractive(sprite, () => {
            object.component.x = sprite.x;
            object.component.y = -sprite.y;
        });

        this.objects.push(object);
        return object;
    }

    addSprite(x, y, sheet, name, scale = 1) {
        const result = Sprites.createSprite(sheet, name, x, y, scale);
        this.app.stage.addChild(result.sprite);
        this.makeInteractive(result.sprite, () => {
            result.component.x = result.sprite.x;
            result.component.y = -result.sprite.y;
        });
        this.objects.push(result);
        return result;
    }

    makeInteractive(thing, callback) {
        thing.interactive = true;
        thing.rightdown = (event) => {
            thing.dragging = true;
            thing.startx = event.data.global.x - thing.x;
            thing.starty = event.data.global.y - thing.y;
        }
        thing.pointermove = (event) => {
            if (thing.dragging) {
                thing.x = event.data.global.x - thing.startx;
                thing.y = event.data.global.y - thing.starty;
            }
        }
        thing.rightup = (event) => {
            thing.dragging = false;
            callback();
        }
    }

    getGeneratedTextures() {
        return this.generated;
    }
}

export default Editor;