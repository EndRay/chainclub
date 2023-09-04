const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.globalCompositeOperation = 'source-over';

this.game = new Game();
canvas.addEventListener('mousedown', async (e) => {
    if (this.game.balls.length === 0)
        this.game = new Game();
});

canvas.addEventListener('mousedown', async (e) => {
    if (e.button === 0) {
        this.game.mousePressed(e.offsetX, e.offsetY);
    }
});


canvas.addEventListener('mouseup', async (e) => {
    if (e.button === 0) {
        this.game.mouseReleased();
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