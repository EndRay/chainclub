class Missile extends SpriteObject {
    fly_speed

    constructor(x, y, angle){
        super();
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.fly_speed = MISSILE_INITIAL_SPEED;
    }

    update(delta){
        this.fly_speed += MISSILE_ACCELERATION * delta;
        this.x += this.fly_speed * Math.cos(this.angle) * delta;
        this.y += this.fly_speed * Math.sin(this.angle) * delta;
    }

    _drawSprite(){
        ctx.fillStyle = MISSILE_COLOR;
        ctx.fillRect(-MISSILE_RADIUS, -MISSILE_RADIUS/2, MISSILE_RADIUS*1.5, MISSILE_RADIUS);
        ctx.beginPath();
        ctx.arc(MISSILE_RADIUS/2, 0, MISSILE_RADIUS/2, 0, 2*Math.PI);
        ctx.fill();
    }
}