class Drawer {
    game
    ctx
    constructor(game, ctx) {
        this.game = game
        this.ctx = ctx
    }

    draw() {
        this.drawBackground();
        this.drawParticles();
        this.drawBalls();
        this.drawRailgunAims();
        this.drawRailgunLasers();
        this.drawRailguns();
        this.drawCanons();
        this.drawMissiles();
        this.drawBonuses();
        this.drawScore();
        this.drawHighscore();
    }

    drawBackground() {
        this.ctx.fillStyle = BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, game.width, game.height);
    }

    drawBalls() {
        for (let ball of game.balls) {
            if (game.holding) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = ball.isInvincible() ? BALL_INVINCIBLE_COLOR : BALL_COLOR;
                this.ctx.moveTo(game.pinPos[0], game.pinPos[1]);
                this.ctx.lineTo(ball.x, ball.y);
                this.ctx.stroke();
            }
            ball.draw(this.ctx);
        }
    }

    drawRailguns(){
        for (let railgun of game.railguns) {
            railgun.draw(this.ctx);
        }
    }

    drawRailgunAims(){
        for (let railgun of game.railguns) {
            if(railgun.isAiming()) {
                this.ctx.save();
                railgun.setRelative(this.ctx);
                this.ctx.beginPath();
                this.ctx.strokeStyle = RAILGUN_LASER_COLOR;
                this.ctx.globalAlpha *= (1 - railgun.cooldown / RAILGUN_AIM_TIME) * 0.7;
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(game.LASERS_LENGTH, 0);
                this.ctx.stroke();
                this.ctx.restore();
            }
        }
    }

    drawRailgunLasers(){
        for (let laser of game.railgunLasers){
            this.ctx.save();
            this.ctx.translate(laser.x, laser.y);
            this.ctx.rotate(laser.angle);
            this.ctx.globalAlpha *= laser.lifeTime / RAILGUN_LASER_LIFETIME;
            this.ctx.beginPath();
            this.ctx.strokeStyle = RAILGUN_LASER_COLOR;
            this.ctx.lineWidth = 6;
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(game.LASERS_LENGTH, 0);
            this.ctx.stroke();
            this.ctx.restore();
        }
    }

    drawCanons() {
        for (let canon of game.canons) {
            canon.draw(this.ctx);
        }
    }

    drawMissiles() {
        for (let missile of game.missiles) {
            missile.draw(this.ctx);
        }
    }

    drawParticles() {
        for (let particle of game.particles) {
            particle.draw(this.ctx);
        }
    }

    drawBonuses() {
        for (let bonus of game.bonuses) {
            bonus.draw(this.ctx);
        }
    }

    drawScore() {
        this.ctx.save();
        this.ctx.globalAlpha *= 0.5;
        this.ctx.font = "30px Comic Sans MS";
        this.ctx.fillStyle = "grey";
        this.ctx.textAlign = "left";
        this.ctx.fillText(Math.floor(game.score).toString(), 10, game.height - 10);
        this.ctx.restore();
    }

    drawHighscore() {
        this.ctx.save();
        this.ctx.globalAlpha *= 0.5;
        this.ctx.font = "30px Comic Sans MS";
        this.ctx.fillStyle = "yellow";
        this.ctx.textAlign = "right";
        this.ctx.fillText(Math.floor(game.highscore).toString(), game.width - 10, game.height - 10);
        this.ctx.restore();
    }
}