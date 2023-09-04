class Canon extends SpriteObject {
    cooldown
    missiles = []
    constructor(x, y){
        super();
        this.x = x;
        this.y = y;
        this.cooldown = CANON_COOLDOWN;
    }

    _drawSprite(ctx) {
        ctx.fillStyle = ENEMY_COLOR_1;
        ctx.beginPath();
        ctx.arc(0, 0, CANON_RADIUS*0.75, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillRect(0, -CANON_RADIUS/4, CANON_RADIUS*1.25, CANON_RADIUS/2);

        ctx.fillStyle = ENEMY_COLOR_2;
        ctx.beginPath();
        ctx.arc(0, 0, CANON_RADIUS*0.5, 0, 2 * Math.PI);
        ctx.fill();
        if(this.cooldown < CANON_ALERT_TIME)
            ctx.fillStyle = CANON_ALERT_COLOR;
        ctx.fillRect(CANON_RADIUS*17/20, -CANON_RADIUS/4, CANON_RADIUS/10, CANON_RADIUS/2);
    }
}