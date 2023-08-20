class Canon extends SpriteObject {
    cooldown
    missiles = []
    constructor(x, y){
        super();
        this.x = x;
        this.y = y;
        this.cooldown = CANON_COOLDOWN;
    }

    update(delta){
        this.cooldown -= delta;
        if(this.cooldown <= 0){
            this.cooldown += CANON_COOLDOWN;
            const offset_x = Math.cos(this.angle) * CANON_RADIUS;
            const offset_y = Math.sin(this.angle) * CANON_RADIUS;
            this.missiles.push(new Missile(this.x + offset_x, this.y + offset_y, this.angle));
        }
    }

    draw(ctx){
        for(let missile of this.missiles){
            missile.draw(ctx);
        }
        super.draw(ctx);
    }

    _drawSprite(ctx) {
        ctx.fillStyle = CANON_COLOR_1;
        ctx.beginPath();
        ctx.arc(0, 0, CANON_RADIUS*0.75, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillRect(0, -CANON_RADIUS/4, CANON_RADIUS*1.25, CANON_RADIUS/2);

        ctx.fillStyle = CANON_COLOR_2;
        ctx.beginPath();
        ctx.arc(0, 0, CANON_RADIUS*0.5, 0, 2 * Math.PI);
        ctx.fill();
        if(this.cooldown < CANON_ALERT_TIME)
            ctx.fillStyle = CANON_ALERT_COLOR;
        ctx.fillRect(CANON_RADIUS*17/20, -CANON_RADIUS/4, CANON_RADIUS/10, CANON_RADIUS/2);
    }
}