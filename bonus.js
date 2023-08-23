class Bonus extends SpriteObject {
    constructor(x, y){
        super();
        this.x = x;
        this.y = y;
    }

    _drawSprite(ctx) {
        ctx.fillStyle = BONUS_COLOR;
        ctx.globalAlpha = 0.5;
        ctx.beginPath()
        ctx.arc(0, 0, BONUS_RADIUS, 0, 2 * Math.PI);
        ctx.fill();
    }
}