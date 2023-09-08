const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.globalCompositeOperation = 'source-over';

// start music on first interaction
document.addEventListener('click', () => {
    const music = new Audio(BACKGROUND_MUSIC);
    music.loop = true;
    music.play();
}, { once: true});

const restartGame = () => {
    this.game = new Game();
    this.drawer = new Drawer(this.game, ctx);
}

const restartGameIfNeeded = () => {
    if (this.game.balls.length === 0)
        restartGame();
}

// mouse
canvas.addEventListener('mousedown', async () => restartGameIfNeeded());

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

// touchscreen
canvas.addEventListener('touchstart', async () => restartGameIfNeeded());

canvas.addEventListener("touchstart", async (e) => {
    e.preventDefault();
    this.game.mousePressed(e.touches[0].clientX, e.touches[0].clientY);
});
canvas.addEventListener("touchend", async (e) => {
    e.preventDefault();
    this.game.mouseReleased();
});


restartGame();

setInterval(() => {
    this.game.update(1 / FPS);
    this.drawer.draw();
}, 1000 / FPS);