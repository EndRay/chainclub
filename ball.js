// ball inherits from both SpriteObject and KineticObject
class Ball extends KineticObject {
    invincibility
    stringLength
    constructor(x, y) {
        super()

        this.x = x;
        this.y = y;

        this.invincibility = 0;
    }

    isInvincible() {
        return this.invincibility > 0;
    }

    update(delta) {
        super.update(delta);

        if (this.vx === 0 && this.vy === 0) {
            this.vx = 1;
        }
        const speed = Math.hypot(this.vx, this.vy);
        if (speed < BALL_MIN_SPEED) {
            // TODO: change color
            this.vx += this.vx / speed * BALL_ACCELERATION * delta;
            this.vy += this.vy / speed * BALL_ACCELERATION * delta;
        }
        if (speed > BALL_MAX_SPEED) {
            this.vx -= this.vx / speed * BALL_ACCELERATION * delta;
            this.vy -= this.vy / speed * BALL_ACCELERATION * delta;
        }
        if (this.x < 0){
            this.vx = Math.abs(this.vx);
        }
        if (this.x > canvas.width){
            this.vx = -Math.abs(this.vx);
        }
        if (this.y < 0){
            this.vy = Math.abs(this.vy);
        }
        if (this.y > canvas.height){
            this.vy = -Math.abs(this.vy);
        }
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