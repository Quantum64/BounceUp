import Point from './Point';

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