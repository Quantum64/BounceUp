import * as PIXI from 'pixi.js';

const resources = {
    tracer: {
        name: "particle",
        path: "assets/sprites/particle.png"
    },
    fruit: {
        name: "fruit",
        path: "assets/spritesheets/fruit.png"
    },
    loading: {
        name: "loading",
        path: "assets/sprites/loading.png"
    }
}

const values = [];
for (var key in resources) {
    values.push(resources[key]);
}
export default class Resources {
    static loaded = resources;

    static getResources() {
        return values;
    }

    static getResource(resource) {
        return PIXI.loader.resources[resource.name];
    }
}