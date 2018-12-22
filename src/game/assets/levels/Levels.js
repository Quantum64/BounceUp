import testLevel from './Test';

const uuid = require('uuid/v4');
const levels = [testLevel];

const required = ["definitions", "objects", "sprites"];
for (const level of levels) {
    for (const prop of required) {
        if (level[prop] === undefined) {
            level[prop] = {};
        }
    }
}

export default class Levels {
    static getLevel(name) {
        for (const level of levels) {
            if (level.name === name) {
                return level;
            }
        }
        return levels[0];
    }

    // static levelToString(level) {
    //     const clone = { ...level };
    //     for (const object of clone.objects) {
    //         delete object.uuid;
    //     }
    //     for (const sprite of clone.sprites) {
    //         delete sprite.uuid;
    //     }
    //     return JSON.stringify(clone);
    // }

    // static getUUID(component) {
    //     if (component.uuid === undefined) {
    //         component.uuid = uuid();
    //     }
    //     return component.uuid;
    // }

    static levelToString(level) {
        const clone = { ...level };
        for (const key in clone.definitions) {
            delete clone.definitions[key].shapes;
        }
        const cache = [];
        const result = JSON.stringify(level, function (key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    try {
                        return JSON.parse(JSON.stringify(value));
                    } catch (error) {
                        return;
                    }
                }
                cache.push(value);
            }
            return value;
        });
        return result;
    }
}