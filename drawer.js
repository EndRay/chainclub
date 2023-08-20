function draw(ctx, game) {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, game.width, game.height);

    game.balls.forEach(ball => {
        if(game.holding){
            ctx.beginPath();
            ctx.strokeStyle = STRING_COLOR;
            ctx.moveTo(game.pinPos[0], game.pinPos[1]);
            ctx.lineTo(ball.x, ball.y);
            ctx.stroke();
        }

        ball.draw(ctx);
    });

    game.canons.forEach(canon => {
        canon.draw(ctx);
    });
}