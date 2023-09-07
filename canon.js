class Canon {
    cooldown
    missiles = []
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.cooldown = CANON_COOLDOWN;
    }
}