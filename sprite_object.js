class SpriteObject{
    x
    y
    angle = 0
    draw(ctx){
        ctx.save()
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        this._drawSprite(ctx);
        ctx.restore();
    }

    _drawSprite(ctx){
        console.error('You need to implement _drawSprite(ctx) in your class');
    }
}