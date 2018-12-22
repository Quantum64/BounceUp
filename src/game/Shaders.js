import * as PIXI from 'pixi.js';
import Resources from './Resources'

import darkenMinusX from './assets/shaders/darken-x.frag.js'
import darkenMinusY from './assets/shaders/darken-y.frag.js'

import lightenMinusX from './assets/shaders/lighten-x.frag.js'
import lightenMinusY from './assets/shaders/lighten-y.frag.js'

const darkenMinusXShader = new PIXI.Filter('', darkenMinusX);
const darkenMinusYShader = new PIXI.Filter('', darkenMinusY);

const lightenMinusXShader = new PIXI.Filter('', lightenMinusX);
const lightenMinusYShader = new PIXI.Filter('', lightenMinusY);

const skyUniforms = {
    color1: {
        type: "vec3",
        value: new Float32Array([0.2, 0.4, 1.0]),
    },
    color2: {
        type: "vec3",
        value: new Float32Array([0, 1.0, 0])
    },
    amount: {
        type: "f",
        value: 0.4
    }
}

export default class Shaders {
    static init() {
        this.skyShader = new PIXI.Filter('', Resources.loaded.sky.data, skyUniforms);
    }

    static sky() {
        return {
            shader: this.skyShader,
            uniforms: { ...skyUniforms }
        }
    }

    static lighten() {
        return [lightenMinusXShader, lightenMinusYShader];
    }

    static darken() {
        return [darkenMinusXShader, darkenMinusYShader];
    }
}