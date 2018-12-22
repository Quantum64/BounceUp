import * as PIXI from 'pixi.js';
import * as planck from 'planck-js';
import * as util from './util/Util';

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.pixiPoint = new PIXI.Point(this.x, this.y);
        this.vecPoint = planck.Vec2(this.x, this.y);
    }

    add(x, y) {
        return new Point(this.x + x, this.y + y);
    }

    multiply(x, y) {
        return new Point(this.x * x, this.y * y);
    }

    toPixiPoint() {
        return this.pixiPoint;
    }

    toVec2() {
        return this.vecPoint;
    }

    toArray() {
        return [this.x, this.y];
    }

    scaleToPhysics() {
        return new Point(util.scaleToPhysics(this.x), util.scaleToPhysics(this.y));
    }
}

export default Point;