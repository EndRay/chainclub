class Railgun extends SpriteObject {
    cooldown
    constructor(x, y){
        super();
        this.x = x;
        this.y = y;
        this.cooldown = RAILGUN_COOLDOWN;
    }

    _drawSprite(ctx) {
        ctx.fillStyle = ENEMY_COLOR_1;
        ctx.beginPath();
        ctx.arc(0, 0, RAILGUN_RADIUS*0.85, 0.25 * Math.PI, 1.75 * Math.PI);
        ctx.arc(0, 0, RAILGUN_RADIUS*0.35, 1.65 * Math.PI, 0.35 * Math.PI, true);
        ctx.fill();
        ctx.fillRect(0, -RAILGUN_RADIUS/6, RAILGUN_RADIUS*1.75, RAILGUN_RADIUS/3);

        ctx.beginPath();

        const rotateSideThings = 0.15 + (this.cooldown > RAILGUN_SHOOT_TIME ? 0 : 0.1 * (RAILGUN_SHOOT_TIME - this.cooldown) / RAILGUN_SHOOT_TIME);

        ctx.arc(0, 0, RAILGUN_RADIUS*0.85, rotateSideThings * Math.PI, (2 - rotateSideThings) * Math.PI);
        ctx.arc(0, 0, RAILGUN_RADIUS*0.65, (2 - rotateSideThings) * Math.PI, rotateSideThings * Math.PI, true);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = ENEMY_COLOR_2;
        ctx.beginPath();
        ctx.arc(0, 0, RAILGUN_RADIUS*0.35, 0, 2 * Math.PI);
        ctx.fill();
        if(this.cooldown < RAILGUN_SHOOT_TIME / 3)
            ctx.fillStyle = RAILGUN_LASER_COLOR;
        ctx.fillRect(RAILGUN_RADIUS*5/4, -RAILGUN_RADIUS/4, RAILGUN_RADIUS/10, RAILGUN_RADIUS/2);
        if(this.cooldown < RAILGUN_SHOOT_TIME / 3 * 2)
            ctx.fillStyle = RAILGUN_LASER_COLOR;
        ctx.fillRect(RAILGUN_RADIUS*4/4, -RAILGUN_RADIUS/4, RAILGUN_RADIUS/10, RAILGUN_RADIUS/2);
        if(this.cooldown < RAILGUN_SHOOT_TIME / 3 * 3)
            ctx.fillStyle = RAILGUN_LASER_COLOR;
        ctx.fillRect(RAILGUN_RADIUS*3/4, -RAILGUN_RADIUS/4, RAILGUN_RADIUS/10, RAILGUN_RADIUS/2);
    }

    isAiming() {
        return this.cooldown < RAILGUN_AIM_TIME
    }

    isShooting(){
        return this.cooldown < RAILGUN_SHOOT_TIME;
    }
}