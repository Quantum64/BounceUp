import * as PIXI from 'pixi.js';
import * as planck from 'planck-js';
import Resources from '../../Resources';
import Point from '../../Point';

import fruitSprites from './fruit/Spritesheet'
import fruitPhysics from './fruit/Physics'

const debugPhysics = false;

let loaded = 0;
let sheets = [];
const spritesheets = {
    fruit: {
        sprites: fruitSprites,
        physics: fruitPhysics,
        texture: () => Resources.getResource(Resources.loaded.fruit)
    }
}

export default class Sprites {
    static init(callback) {
        for (const key in spritesheets) {
            const spritesheet = spritesheets[key];
            spritesheet.spritesheet = new PIXI.Spritesheet(spritesheet.texture().texture.baseTexture, spritesheet.sprites);
            sheets.push(spritesheet.spritesheet);
        }
        this.loadNext(callback);
    }

    static loadNext(callback) {
        sheets[loaded].parse(() => {
            loaded++;
            if (loaded === sheets.length) {
                callback();
                return;
            }
            this.loadNext(callback);
        });
    }

    static getSpritesheets() {
        return spritesheets;
    }

    static create(sheet, name, body, x, y, scale = 1) {
        const result = this.createSprite(sheet, name, x, y, scale);
        const physics = spritesheets[sheet].physics;
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
        const sprite = new PIXI.Sprite(spritesheets[sheet].spritesheet.textures[name]);
        sprite.scale.x = scale;
        sprite.scale.y = scale;
        sprite.x = x;
        sprite.y = y;
        return {
            sprite: sprite
        }
    }
}