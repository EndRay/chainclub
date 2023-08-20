class Particle extends KineticObject{
    color
    initialLifeTime
    lifeTime
    constructor(x, y, angle, speed, color, lifeTime){
        super();
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = color;
        this.initialLifeTime = lifeTime;
        this.lifeTime = lifeTime;
    }

    update(delta) {
        super.update(delta);
        this.lifeTime -= delta;
    }

    _drawSprite(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.lifeTime / this.initialLifeTime);
        ctx.fillRect(-1, -1, 2, 2);
        ctx.restore();
    }
}