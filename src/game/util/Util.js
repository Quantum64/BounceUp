import Point from '../Point';

const scale = 20;

export function scaleToPhysics(x) {
    return x / scale;
}

export function scaleToWorld(x) {
    return x * scale;
}

export function normalize(point, len) {
    if ((point.x === 0 && point.y === 0)) {
        return new Point(0, 0);
    }
    const angle = Math.atan2(point.y, point.x);
    const nx = Math.cos(angle) * len;
    const ny = Math.sin(angle) * len;
    return new Point(nx, ny);
}

export function toDegrees(angle) {
    return angle * (180 / Math.PI);
}

export function toRadians(angle) {
    return angle * (Math.PI / 180);
}

export function getScreenCenter() {
    return new Point((window.innerWidth / 2), (window.innerHeight / 2));
}

export function distance(o, u) {
    return Math.sqrt(((o.y - u.y) * (o.y - u.y)) + ((o.x - u.x) * (o.x - u.x)));
}

export function inside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    let x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        let xi = vs[i][0], yi = vs[i][1];
        let xj = vs[j][0], yj = vs[j][1];

        let intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

export function polygonArea(vertices) {
    // https://stackoverflow.com/questions/16285134/calculating-polygon-area
    var total = 0;

    for (var i = 0, l = vertices.length; i < l; i++) {
        var addX = vertices[i].x;
        var addY = vertices[i === vertices.length - 1 ? 0 : i + 1].y;
        var subX = vertices[i === vertices.length - 1 ? 0 : i + 1].x;
        var subY = vertices[i].y;

        total += (addX * addY * 0.5);
        total -= (subX * subY * 0.5);
    }

    return Math.abs(total);
}

export function keyboard(value) {
    // https://github.com/kittykatattack/learningPixi#keyboard

    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    key.downHandler = event => {
        if (event.key === key.value) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };

    key.upHandler = event => {
        if (event.key === key.value) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);

    window.addEventListener(
        "keydown", downListener, false
    );
    window.addEventListener(
        "keyup", upListener, false
    );

    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    };

    return key;
}