import * as planck from 'planck-js';
import * as PIXI from 'pixi.js';
import Point from './Point';
import * as util from './util';
import Input from './Input';
import * as textures from './shaders/shaders';
import Triangulator from './math/triangulate'
import Convex from './math/convex'
import * as PIXIParticles from 'pixi-particles';

const definitions = {
    ground: {
        points: [[0, 200], [100, 190], [200, 170], [300, 120], [400, 40], [500, 20], [600, 30], [700, 60], [800, 40], [850, 10],
        [5000, 10], [5000, 700], [200, 700], [100, 600], [60, 400]],
        internal: 2,
        colors: [{ color: 0xd3c7a2, position: 0 }, { color: 0xa69150, position: 150 }, { color: 0xdbd1b4, position: 300 }]
    },
    tree: {
        points: [[250, 0], [300, 0], [300, 400], [250, 400], [250, 200], [110, 220], [50, 190], [35, 150], [50, 180], [100, 200], [250, 180]],
        internal: 2,
        colors: [{ color: 0x44340d, position: 0 }, { color: 0x4f3a07, position: 200 }]
    }
}

const darkenShaders = textures.darken();

const bakeScale = 2;

class World {
    constructor(game) {
        this.game = game;
        this.app = this.game.app;
        this.input = new Input(this);
        this.objects = [];
        this.physics = planck.World({
            gravity: planck.Vec2(0, 0.01)
        });
        this.physicsStage = this.physics.createBody({
            type: 'static',
            position: planck.Vec2(0, 0),
        });
        this.game.resizeBus.push(() => {
            this.background.clear();
            this.background.beginFill(0x111111);
            this.background.drawRect(0, 0, this.app.renderer.width + 20, this.app.renderer.height + 20);
        });

        // Generate stage textures
        for (const key in definitions) {
            const definition = definitions[key];
            let max = 0;
            //for (const point of definition.points) {
            //    if (point[1] > max) {
            //        max = point[1]
            //    }
            //}
            definition.max = max;
            //definition.points = definition.points.map(point => {
            //    point[1] = max - point[1];
            //    return point;
            //});
            Convex.makeCCW(definition.points);
            //definition.points.reverse();
            definition.shapes = [];
            for (const polygon of Convex.decomp(definition.points)) {
                definition.shapes.push({
                    points: polygon.map(array => new Point(array[0], array[1]))
                });
            }
            console.log("Definition '" + key + "' was split into " + definition.shapes.length + " convex polygons.");
            for (let index = 0; index < definition.shapes.length; index++) {
                const shape = definition.shapes[index];
                shape.texture = this.bakeStageTexture({
                    name: key,
                    index: index,
                    internal: definition.internal,
                    points: shape.points,
                    colors: definition.colors
                });
            }
        }
    }

    init() {
        // Background
        this.backgroundShader = textures.sky();
        this.background = new PIXI.Graphics();
        this.background.beginFill(0x111111);
        this.background.drawRect(0, 0, this.app.renderer.width + 20, this.app.renderer.height + 20);
        this.background.filters = [this.backgroundShader.shader]
        this.app.stage.addChild(this.background);

        this.addStageObject(850, -380, definitions.tree);
        this.addStageObject(0, 0, definitions.ground);

        this.createPlayer();
        this.input.init();
    }

    tick(delta) {
        const center = util.getScreenCenter();

        this.physics.step(delta);
        const playerPosition = this.player.body.getPosition();
        this.player.sprite.x = util.scaleToWorld(playerPosition.x);
        this.player.sprite.y = util.scaleToWorld(playerPosition.y);
        this.player.sprite.rotation += this.player.body.getAngularVelocity() * delta;
        this.app.stage.position.set(center.x - this.player.sprite.x, center.y - this.player.sprite.y);

        this.background.x = this.player.sprite.x - center.x - 10;
        this.background.y = this.player.sprite.y - center.y - 10;
        this.tracer.updateOwnerPos(this.player.sprite.x, this.player.sprite.y);
        this.tracer.update(delta * 0.01);

        this.input.tick(delta);
    }

    createPlayer() {
        const playerSize = 10;

        // Graphics
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0x0000ff);
        graphics.drawCircle(0, 0, playerSize);
        graphics.beginFill(0xff0000);
        graphics.drawCircle(4, 0, playerSize / 3);
        const sprite = new PIXI.Sprite(this.app.renderer.generateTexture(graphics));
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.x = 200;
        sprite.y = 100;

        // Physics
        const body = this.physics.createBody({
            type: 'dynamic',
            position: planck.Vec2(40, -4),
            bullet: true,
            linearDamping: 0.005,
            allowSleep: false
        });
        body.createFixture({
            shape: planck.Circle(util.scaleToPhysics(playerSize)),
            restitution: 0,
            friction: 0.2,
            density: 0.9
        });

        // Effects
        const container = new PIXI.Container();
        this.tracer = new PIXIParticles.Emitter(
            container,
            [PIXI.loader.resources["particle"].texture],
            {
                "alpha": {
                    "start": 1,
                    "end": 0
                },
                "scale": {
                    "start": 0.4,
                    "end": 0.1,
                    "minimumScaleMultiplier": 1
                },
                "color": {
                    "start": "#e4f9ff",
                    "end": "#3fcbff"
                },
                "speed": {
                    "start": 0,
                    "end": 0,
                    "minimumSpeedMultiplier": 1
                },
                "acceleration": {
                    "x": 0,
                    "y": 0
                },
                "maxSpeed": 0,
                "startRotation": {
                    "min": 0,
                    "max": 360
                },
                "noRotation": false,
                "rotationSpeed": {
                    "min": 0,
                    "max": 0
                },
                "lifetime": {
                    "min": 0.8,
                    "max": 0.8
                },
                "blendMode": "normal",
                "frequency": 0.001,
                "emitterLifetime": -1,
                "maxParticles": 1000,
                "pos": {
                    "x": 0,
                    "y": 0
                },
                "addAtBack": true,
                "spawnType": "point"
            }
        );
        this.tracer.emit = true;
        this.app.stage.addChild(container);
        this.app.stage.addChild(sprite);

        this.player = {
            sprite: sprite,
            body: body
        }
    }

    bakeStageTexture(def) {
        def = {
            ...def,
            points: def.points.map(point => point.multiply(bakeScale, bakeScale)),
            colors: def.colors.map(color => { return { color: color.color, position: color.position * bakeScale } })
        }
        const start = new Date();
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0x000000);
        graphics.drawPolygon(def.points.map(point => point.multiply(1, 1).toPixiPoint()));
        graphics.endFill();
        const bounds = graphics.getBounds();
        const container = new PIXI.Container();
        const textures = [];
        const pointsets = [];
        const internal = [];

        for (let i = 0; i < def.internal; i++) {
            let point = null;
            do {
                point = new Point(bounds.x + Math.floor(Math.random() * bounds.width), bounds.y + Math.floor(Math.random() * bounds.height));
            } while (!util.inside(point.toArray(), def.points.map(point => point.toArray())));
            internal.push(point);
        }

        const points = [...def.points, ...internal];
        const triangles = Triangulator.from(points.map(point => point.toArray())).triangles;
        for (let i = 0; i < triangles.length; i += 3) {
            pointsets.push([
                points[triangles[i]],
                points[triangles[i + 1]],
                points[triangles[i + 2]]
            ]);
        }

        for (let index = 0; index < pointsets.length; index++) {
            const points = pointsets[index];
            const texture = new PIXI.Graphics();
            texture.beginFill(0xffffff);
            texture.drawPolygon(points.map(point => point.toPixiPoint()));
            texture.endFill();
            const shape = texture.getBounds();
            texture.clear();

            // Interpolate colors
            const x = shape.x;
            let primary = 0x000000;
            let primaryDistance = -1;
            let accent = 0xffffff;
            let accentDistance = -1;
            for (const color of def.colors) {
                const disance = Math.abs(x - color.position);
                if (primaryDistance === -1) {
                    primaryDistance = disance;
                    primary = color.color;
                    accent = primary;
                    accentDistance = primaryDistance;
                    continue;
                }
                if (disance < primaryDistance) {
                    accent = primary;
                    accentDistance = primaryDistance;
                    primaryDistance = disance;
                    primary = color.color;
                }
            }
            const ratio = accentDistance === 0 ? 1 : primaryDistance / accentDistance;
            const r = (((primary >> 16) & 255) * (1 - ratio)) + (((accent >> 16) & 255) * (ratio));
            const g = (((primary >> 8) & 255) * (1 - ratio)) + (((accent >> 8) & 255) * (ratio));
            const b = ((primary & 255) * (1 - ratio)) + ((accent & 255) * (ratio));
            const color = 0x1000000 + (r << 16) + (g << 8) + b;

            texture.beginFill(color);
            texture.drawPolygon(points.map(point => point.toPixiPoint()));
            texture.endFill();
            const tex = this.app.renderer.generateTexture(texture);
            textures.push(tex);
            const sprite = new PIXI.Sprite(tex);
            sprite.filters = [darkenShaders[index % darkenShaders.length]];
            sprite.blendMode = PIXI.BLEND_MODES.ADD;
            sprite.x = shape.x;
            sprite.y = shape.y;
            container.addChild(sprite);
        }
        //container.filters = [darkenShaders[1], darkenShaders[1]];
        const render = new PIXI.RenderTexture(new PIXI.BaseRenderTexture(bounds.width + bounds.x, bounds.height + bounds.y, PIXI.SCALE_MODES.LINEAR, 1));
        this.app.renderer.render(container, render);
        for (const texture of textures) {
            texture.destroy();
        }

        const end = new Date();
        console.log("Texture '" + def.name + "' polygon " + def.index + " bake took " + (end - start) + "ms");

        return render;
    }

    addStageObject(x, y, def) {
        let index = 0;
        for (const shape of def.shapes) {
            index++;
            // Graphics
            const sprite = new PIXI.Sprite(shape.texture);
            sprite.x = x;
            sprite.y = y - def.max;
            sprite.scale.x = 1 / bakeScale;
            sprite.scale.y = 1 / bakeScale;
            this.app.stage.addChild(sprite);

            // Physics
            const fixture = this.physicsStage.createFixture({
                shape: planck.Polygon(shape.points.map(point => point.add(x, y - def.max).scaleToPhysics().toVec2())),
                friction: 0.9,
                restitution: 0.8
            });

            // Add
            const object = {
                fixture: fixture,
                sprite: sprite
            };
            this.objects.push(object);
        }
    }
}

export default World;
