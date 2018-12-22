export default {
    name: "test",
    definitions: {
        ground: {
            points: [[0, 500], [100, 490], [200, 470], [300, 420], [400, 340], [500, 320], [600, 330], [700, 360], [800, 340], [850, 310],
            [1000, 300], [1500, 100], [2000, 50], [2500, 0], [3000, 50], [4000, 100], [5000, 250], [6000, 100], [7000, 0],
            [7000, 310], [7000, 900], [200, 900], [100, 900], [60, 700]],
            internal: 100,
            colors: [{ color: 0xefea9e, position: 0 }, { color: 0xf7ef99, position: 1000 }, { color: 0xefea9e, position: 2000 }]
        },
        wall: {
            points: [[0, 0], [10, 0], [10, 2000], [0, 2000]],
            internal: 1,
            colors: [{ color: 0x0f0038, position: 0 }, { color: 0x0d0428, position: 50 }]
        }
    },
    objects: [
        {
            name: "ground",
            x: 0,
            y: 0
        },
        {
            name: "wall",
            x: -3000,
            y: 8000
        },
        {
            name: "wall",
            x: -3000,
            y: 6000
        },
        {
            name: "wall",
            x: -3000,
            y: 4000
        },
        {
            name: "wall",
            x: -3000,
            y: 2000
        },
        {
            name: "wall",
            x: -3000,
            y: 0
        }
    ],
    sprites: [
        {
            sheet: "fruit",
            name: "apple",
            x: 50,
            y: 50,
            scale: 0.5
        }
    ]
}