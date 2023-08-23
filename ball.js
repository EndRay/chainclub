// ball inherits from both SpriteObject and KineticObject
class Ball extends SpriteObject {
    invincibility
    constructor(x, y, vx=0, vy=0) {
        super()

        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;

        this.invincibility = 0;
    }

    isInvincible() {
        return this.invincibility > 0;
    }

    _drawSprite(ctx) {
        if(this.isInvincible())
            ctx.fillStyle = BALL_INVINCIBLE_COLOR
        else
            ctx.fillStyle = BALL_COLOR;
        ctx.beginPath();
        ctx.arc(0, 0, BALL_RADIUS, 0, 2 * Math.PI);
        ctx.fill();
    }
}