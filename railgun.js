class Railgun {
    cooldown
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.cooldown = RAILGUN_COOLDOWN;
    }

    isAiming() {
        return this.cooldown < RAILGUN_AIM_TIME
    }

    isShooting(){
        return this.cooldown < RAILGUN_SHOOT_TIME;
    }
}