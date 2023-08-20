class KineticObject extends SpriteObject {
    vx = 0
    vy = 0
    update(delta){
        this.x += this.vx * delta;
        this.y += this.vy * delta;
    }
}