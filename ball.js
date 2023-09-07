// ball inherits from both SpriteObject and KineticObject
class Ball {
    invincibility
    constructor(x, y, vx=0, vy=0) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;

        this.invincibility = 0;
    }

    isInvincible() {
        return this.invincibility > 0;
    }
}