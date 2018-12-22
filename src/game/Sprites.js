import * as PIXI from 'pixi.js';
import * as planck from 'planck-js';
import Resources from './Resources';
import Point from './Point';

const debugPhysics = false;

export default class Sprites {
    static getSheets() {
        return {
            fruit: {
                sprites: Resources.loaded.fruitSpritesheet.value,
                physics: Resources.loaded.fruitPhysics.value,
                texture: Resources.loaded.fruitTexture.value
            }
        };
    }

    static loaded = 0;
    static sheets = [];
    static spritesheets = {};

    static init(callback) {
        this.spritesheets = this.getSheets();
        for (const key in  this.spritesheets) {
            const spritesheet = this.spritesheets[key];
            spritesheet.spritesheet = new PIXI.Spritesheet(spritesheet.texture.texture.baseTexture, spritesheet.sprites.data);
            this.sheets.push(spritesheet.spritesheet);
        }
        this.loadNext(callback);
    }

    static loadNext(callback) {
        this.sheets[this.loaded].parse(() => {
            this.loaded++;
            if (this.loaded ===  this.sheets.length) {
                callback();
                return;
            }
            this.loadNext(callback);
        });
    }

    static getSpritesheets() {
        return  this.spritesheets;
    }

    static create(sheet, name, body, x, y, scale = 1) {
        const result = this.createSprite(sheet, name, x, y, scale);
        const physics = this.spritesheets[sheet].physics.data;
        const fixtures = [];
        const debug = [];
        for (const element of physics.rigidBodies) {
            if (element.name === name) {
                for (const polygon of element.polygons) {
                    const points = polygon.map(p => new Point(p.x, 1.0 - p.y).multiply(result.sprite.width, result.sprite.height).add(x, y));
                    if (debugPhysics) {
                        debug.push(points);
                    }
                    fixtures.push(body.createFixture({
                        shape: planck.Polygon(points.map(point => point.scaleToPhysics().toVec2())),
                        friction: 0.9,
                        restitution: 0.8
                    }));
                }
            }
        }
        result.fixtures = fixtures;
        result.debug = debug;
        return result;
    }

    static createSprite(sheet, name, x = 0, y = 0, scale = 1) {
        const sprite = new PIXI.Sprite(this.spritesheets[sheet].spritesheet.textures[name]);
        sprite.scale.x = scale;
        sprite.scale.y = scale;
        sprite.x = x;
        sprite.y = y;
        return {
            sprite: sprite
        }
    }
}