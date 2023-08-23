const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.globalCompositeOperation = 'source-over';

const game = new Game();

game.balls.push(new Ball(100, 100));
game.canons.push(new Canon(100, 200));

canvas.addEventListener('mousedown', async (e) => {
    if (e.button === 0) {
        game.mousePressed(e.offsetX, e.offsetY);
    }
});

canvas.addEventListener('mouseup', async (e) => {
    if (e.button === 0) {
        game.mouseReleased();
    }
});


canvas.addEventListener("touchstart", async (e) => {
    e.preventDefault();
    game.mousePressed(e.touches[0].clientX, e.touches[0].clientY);
});
canvas.addEventListener("touchend", async (e) => {
    e.preventDefault();
    game.mouseReleased();
});

setInterval(() => {
    game.update(1 / FPS);
    game.draw(ctx);
}, 1000 / FPS);