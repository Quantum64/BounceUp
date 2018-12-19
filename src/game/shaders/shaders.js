import * as PIXI from 'pixi.js';
import skyFrag from './sky.frag.js'
import darkenMinusX from './darken-x.frag.js'
import darkenMinusY from './darken-y.frag.js'

const darkenMinusXShader = new PIXI.Filter('', darkenMinusX);
const darkenMinusYShader = new PIXI.Filter('', darkenMinusY);
export function darken() {
    return [darkenMinusXShader, darkenMinusYShader];
}

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
const skyShader = new PIXI.Filter('', skyFrag, skyUniforms);
export function sky() {
    return {
        shader: skyShader,
        uniforms: skyUniforms
    }
}

function hexToRgb(hex) {
    var r = (hex >> 16) & 255;
    var g = (hex >> 8) & 255;
    var b = hex & 255;

    return (r / 255).toFixed(3) + "," + (b / 255).toFixed(3) + "," + (g / 255).toFixed(3);

}