import * as PIXI from 'pixi.js';

const resources = {
    // Misc sprites
    tracer: {
        name: "particle",
        path: "assets/sprites/particle.png"
    },
    loading: {
        name: "loading",
        path: "assets/sprites/loading.png"
    },

    // Fruit
    fruitTexture: {
        name: "fruitTexture",
        path: "assets/spritesheets/fruit/texture.png"
    },
    fruitSpritesheet: {
        name: "fruitSpritesheet",
        path: "assets/spritesheets/fruit/spritesheet.json"
    },
    fruitPhysics: {
        name: "fruitPhysics",
        path: "assets/spritesheets/fruit/physics.json"
    },
    
    // Shaders
    sky: {
        name: "sky",
        path: "assets/shaders/sky.frag"
    }
}

const values = [];
for (let key in resources) {
    values.push(resources[key]);
}
export default class Resources {
    static loaded = resources;

    static getResources() {
        return values;
    }

    static postLoad() {
        for (let key in resources) {
            const resource = resources[key];
            resource.value = PIXI.loader.resources[resource.name];
            resource.data = resource.value.data;
            resource.texture = resource.value.texture;
        }
    }

    static getResource(resource) {
        return PIXI.loader.resources[resource.name];
    }
}