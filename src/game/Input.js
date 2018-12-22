import * as PIXI from 'pixi.js'
import Point from './Point';
import * as util from './util/Util';

class Input {
    constructor(world) {
        this.world = world;
        this.app = world.app;
        this.offset = new Point(0, 0);
        this.multiplier = 1;
        this.check = 30;
        this.app.stage.interactive = true;
    }

    init() {
        const graphics = new PIXI.Graphics();
        graphics.lineStyle(10, 0xffffff);
        graphics.moveTo(0, 0).lineTo(10, 0);
        graphics.x = 500;
        graphics.y = 500;
        graphics.rotation = 0;
        this.line = new PIXI.Sprite(graphics.generateCanvasTexture());
        this.line.alpha = 0.2;
        this.world.window.addChild(this.line);

        this.app.stage.mousemove = (event) => this.mouseMove(event);
        this.app.stage.mousedown = (event) => this.mouseDown(event);

        this.world.physics.on("begin-contact", (fixture) => {
            this.multiplier = 0;
        });
    }

    tick(delta) {
        this.line.x = this.world.player.sprite.x + this.offset.x;
        this.line.y = this.world.player.sprite.y + this.offset.y;
        this.line.scale.x = this.multiplier < 0.05 ? 0 : this.force / 20 * this.multiplier;

        const velocity = this.world.player.body.getLinearVelocity();
        if (Math.abs(velocity.x) + Math.abs(velocity.y) < 0.005) {
            this.check--;
        }
        if (this.check <= 0) {
            this.multiplier = 1;
            this.check = 30;
            this.world.player.body.setAwake(false);
        }

        // cheat mode
        this.multiplier = 1;
    }

    mouseDown(event) {
        const force = 0.7;
        this.multiplier *= 0.5;
        if (this.multiplier < 0.05) {
            return;
        }

        this.mouseMove(event); // Hack??
        const center = util.getScreenCenter();
        const ang = Math.atan2(this.mouse.y - center.y, this.mouse.x - center.x);
        const x = -Math.cos(ang) * force * util.scaleToPhysics(this.force) * this.multiplier;
        const y = -Math.sin(ang) * force * util.scaleToPhysics(this.force) * this.multiplier;
        this.world.player.body.applyLinearImpulse(new Point(x, y).scaleToPhysics().toVec2(), this.world.player.body.getWorldCenter(), true);
    }

    mouseMove(event) {
        const center = util.getScreenCenter();
        this.mouse = new Point(event.data.global.x, event.data.global.y);
        const ang = Math.atan2(this.mouse.y - center.y, this.mouse.x - center.x);
        const offsetAmount = 20;
        this.offset = new Point(Math.cos(ang) * offsetAmount, Math.sin(ang) * offsetAmount);
        this.line.rotation = ang;

        const distance = util.distance(new Point(this.mouse.x, this.mouse.y), center);
        this.force = distance;
    }
}

export default Input;