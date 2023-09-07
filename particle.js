class Particle {
    color
    initialLifeTime
    lifeTime
    constructor(x, y, angle, speed, color, lifeTime){
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
    }
}