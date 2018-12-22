import * as planck from 'planck-js';
import * as PIXI from 'pixi.js';
import Point from './Point';
import * as util from './util/Util';
import Input from './Input';
import * as shaders from './assets/shaders/Shaders';
import Triangulator from './util/math/Triangulate'
import Convex from './util/math/Convex';
import * as PIXIParticles from 'pixi-particles';
import Resources from './Resources';
import Sprites from './assets/sprites/Sprites'

const darkenShaders = shaders.darken();
const lightenShaders = shaders.lighten();

const bakeScale = 1.5;

class World {
    constructor(game) {
        this.definitions = game.level.definitions;
        this.game = game;
        this.level = game.level;
        this.app = this.game.app;
        this.input = new Input(this);
        this.objects = [];
        this.generated = [];
        this.initialPlayerPosition = new Point(400, 100);
        this.window = new PIXI.Container();
    }

    init() {
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
        for (const key in this.definitions) {
            const definition = this.definitions[key];
            const start = new Date();
            Convex.makeCCW(definition.points);
            //definition.points.reverse();
            definition.shapes = [];
            for (const polygon of Convex.fastDecomp(definition.points)) {
                definition.shapes.push({
                    points: polygon.map(array => new Point(array[0], array[1]))
                });
            }
            console.log("Definition '" + key + "' was split into " + definition.shapes.length + " convex polygons (" + (new Date() - start) + " ms).");
            let area = 0;
            for (let shape of definition.shapes) {
                area += util.polygonArea(shape.points);
            }
            for (let index = 0; index < definition.shapes.length; index++) {
                const shape = definition.shapes[index];
                shape.texture = this.bakeStageTexture({
                    name: key,
                    index: index,
                    internal: Math.ceil((util.polygonArea(shape.points) / area) * definition.internal),
                    points: shape.points,
                    colors: definition.colors
                });
            }
        }
        
        // Background
        this.backgroundShader = shaders.sky();
        this.background = new PIXI.Graphics();
        this.background.beginFill(0x111111);
        this.background.drawRect(0, 0, this.app.renderer.width + 20, this.app.renderer.height + 20);
        this.background.filters = [this.backgroundShader.shader]
        this.background.x = -10;
        this.background.y = -10;
        this.app.stage.addChild(this.background);
        
        for (const object of this.level.objects) {
            this.addStageObject(object.x, object.y * -1, this.definitions[object.name]);
        }
        for (const sprite of this.level.sprites) {
            const scale = sprite.scale === undefined ? 1 : sprite.scale;
            this.addSprite(sprite.x, sprite.y * -1, sprite.sheet, sprite.name, scale);
        }
        
        this.createPlayer();
        this.input.init();

        this.app.stage.addChild(this.window);
    }

    tick(delta) {
        const center = util.getScreenCenter();

        this.physics.step(delta);
        const playerPosition = this.player.body.getPosition();
        this.player.sprite.x = util.scaleToWorld(playerPosition.x);
        this.player.sprite.y = util.scaleToWorld(playerPosition.y);
        this.player.sprite.rotation += this.player.body.getAngularVelocity() * delta;
        this.window.position.set(center.x - this.player.sprite.x, center.y - this.player.sprite.y);

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
        const texture = this.app.renderer.generateTexture(graphics);
        this.generated.push(texture);
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.x = 200;
        sprite.y = 100;

        // Physics
        const body = this.physics.createBody({
            type: 'dynamic',
            position: this.initialPlayerPosition.scaleToPhysics().toVec2(),
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
            [Resources.getResource(Resources.loaded.tracer).texture],
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
        this.window.addChild(container);
        this.window.addChild(sprite);

        this.player = {
            sprite: sprite,
            body: body
        }
    }

    bakeStageTexture(definition) {
        definition = {
            ...definition,
            points: definition.points.map(point => point.multiply(bakeScale, bakeScale)),
            colors: definition.colors.map(color => { return { color: color.color, position: color.position * bakeScale } })
        }
        const start = new Date();
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0x000000);
        graphics.drawPolygon(definition.points.map(point => point.multiply(1, 1).toPixiPoint()));
        graphics.endFill();
        const bounds = graphics.getBounds();
        const container = new PIXI.Container();
        const textures = [];
        const pointsets = [];
        const internal = [];

        for (let i = 0; i < definition.internal; i++) {
            let point = null;
            do {
                point = new Point(bounds.x + Math.floor(Math.random() * bounds.width), bounds.y + Math.floor(Math.random() * bounds.height));
            } while (!util.inside(point.toArray(), definition.points.map(point => point.toArray())));
            internal.push(point);
        }

        const points = [...definition.points, ...internal];
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
            for (const color of definition.colors) {
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
            sprite.filters = [lightenShaders[index % lightenShaders.length]];
            sprite.blendMode = PIXI.BLEND_MODES.ADD;
            sprite.x = shape.x;
            sprite.y = shape.y;
            container.addChild(sprite);
        }
        //container.filters = [darkenShaders[1], darkenShaders[1]];
        const render = new PIXI.RenderTexture(new PIXI.BaseRenderTexture(bounds.width + bounds.x, bounds.height + bounds.y, PIXI.SCALE_MODES.LINEAR, 1));
        this.app.renderer.render(container, render);
        for (const texture of textures) {
            texture.destroy(true);
        }

        const end = new Date();
        console.log("Texture '" + definition.name + "' polygon " + definition.index + " (Internal: " + definition.internal + ") bake took " + (end - start) + "ms");

        this.generated.push(render);
        return render;
    }

    addStageObject(x, y, definition) {
        console.log(definition)
        for (const shape of definition.shapes) {
            // Graphics
            const sprite = new PIXI.Sprite(shape.texture);
            sprite.x = x;
            sprite.y = y;
            sprite.scale.x = 1 / bakeScale;
            sprite.scale.y = 1 / bakeScale;
            this.window.addChild(sprite);

            // Physics
            const fixture = this.physicsStage.createFixture({
                shape: planck.Polygon(shape.points.map(point => point.add(x, y).scaleToPhysics().toVec2())),
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

    addSprite(x, y, sheet, name, scale = 1) {
        const result = Sprites.create(sheet, name, this.physicsStage, x, y, scale);
        this.window.addChild(result.sprite);

        if (result.debug.length > 0) {
            let graphics = new PIXI.Graphics();
            graphics.beginFill(0xffffff);
            for (let polygon of result.debug) {
                graphics.drawPolygon(polygon.map(point => point.toPixiPoint()));
            }
            graphics.endFill();
            this.window.addChild(graphics);
        }

        this.objects.push(result);
    }

    getGeneratedTextures() {
        return this.generated;
    }
}

export default World;
