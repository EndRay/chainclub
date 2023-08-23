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
        game.mouseReleased(e.x, e.y);
    }
});


canvas.addEventListener("ontouchstart", async (e) => {
    e.preventDefault();
    game.mousePressed(e.touches[0].clientX, e.touches[0].clientY);
});
canvas.addEventListener("ontouchend", async (e) => {
    e.preventDefault();
    game.mouseReleased(e.touches[0].clientX, e.touches[0].clientY);
});

setInterval(() => {
    game.update(1 / FPS);
    game.draw(ctx);
}, 1000 / FPS);