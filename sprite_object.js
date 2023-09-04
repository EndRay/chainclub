class SpriteObject{
    x
    y
    angle = 0

    setRelative(ctx) {
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
    }

    draw(ctx){
        ctx.save()
        this.setRelative(ctx);
        this._drawSprite(ctx);
        ctx.restore();
    }

    _drawSprite(ctx){
        console.error('You need to implement _drawSprite(ctx) in your class');
    }
}