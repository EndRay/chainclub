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
            this.drawBall(ball);
        }
    }

    drawRailguns(){
        for (let railgun of game.railguns) {
            this.drawRailgun(railgun);
        }
    }

    drawRailgunAims(){
        for (let railgun of game.railguns) {
            if(railgun.isAiming()) {
                this.ctx.save();
                this.setRelative(railgun);
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
            this.drawCanon(canon);
        }
    }

    drawMissiles() {
        for (let missile of game.missiles) {
            this.drawMissile(missile);
        }
    }

    drawParticles() {
        for (let particle of game.particles) {
            this.drawParticle(particle);
        }
    }

    drawBonuses() {
        for (let bonus of game.bonuses) {
            this.drawBonus(bonus);
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

    setRelative(obj){
        this.ctx.translate(obj.x, obj.y);
        this.ctx.rotate(obj.angle);
    }

    drawBall(ball){
        this.ctx.save();
        this.setRelative(ball);

        if(ball.isInvincible())
            this.ctx.fillStyle = BALL_INVINCIBLE_COLOR
        else
            this.ctx.fillStyle = BALL_COLOR;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, BALL_RADIUS, 0, 2 * Math.PI);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawMissile(missile){
        this.ctx.save();
        this.setRelative(missile);

        this.ctx.fillStyle = MISSILE_COLOR;
        this.ctx.fillRect(-MISSILE_RADIUS, -MISSILE_RADIUS/2, MISSILE_RADIUS*1.5, MISSILE_RADIUS);
        this.ctx.beginPath();
        this.ctx.arc(MISSILE_RADIUS/2, 0, MISSILE_RADIUS/2, 0, 2*Math.PI);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawParticle(particle){
        this.ctx.save();
        this.setRelative(particle);

        this.ctx.fillStyle = particle.color;
        this.ctx.globalAlpha = Math.max(0, particle.lifeTime / particle.initialLifeTime);
        this.ctx.fillRect(-1, -1, 2, 2);

        this.ctx.restore();
    }
    
    drawRailgun(railgun){
        this.ctx.save();
        this.setRelative(railgun);
        
        this.ctx.fillStyle = ENEMY_COLOR_1;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, RAILGUN_RADIUS*0.85, 0.25 * Math.PI, 1.75 * Math.PI);
        this.ctx.arc(0, 0, RAILGUN_RADIUS*0.35, 1.65 * Math.PI, 0.35 * Math.PI, true);
        this.ctx.fill();
        this.ctx.fillRect(0, -RAILGUN_RADIUS/6, RAILGUN_RADIUS*1.75, RAILGUN_RADIUS/3);

        this.ctx.beginPath();

        const rotateSideThings = 0.15 + (railgun.cooldown > RAILGUN_SHOOT_TIME ? 0 : 0.1 * (RAILGUN_SHOOT_TIME - railgun.cooldown) / RAILGUN_SHOOT_TIME);

        this.ctx.arc(0, 0, RAILGUN_RADIUS*0.85, rotateSideThings * Math.PI, (2 - rotateSideThings) * Math.PI);
        this.ctx.arc(0, 0, RAILGUN_RADIUS*0.65, (2 - rotateSideThings) * Math.PI, rotateSideThings * Math.PI, true);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = ENEMY_COLOR_2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, RAILGUN_RADIUS*0.35, 0, 2 * Math.PI);
        this.ctx.fill();
        if(railgun.cooldown < RAILGUN_SHOOT_TIME / 3)
            this.ctx.fillStyle = RAILGUN_LASER_COLOR;
        this.ctx.fillRect(RAILGUN_RADIUS*5/4, -RAILGUN_RADIUS/4, RAILGUN_RADIUS/10, RAILGUN_RADIUS/2);
        if(railgun.cooldown < RAILGUN_SHOOT_TIME / 3 * 2)
            this.ctx.fillStyle = RAILGUN_LASER_COLOR;
        this.ctx.fillRect(RAILGUN_RADIUS*4/4, -RAILGUN_RADIUS/4, RAILGUN_RADIUS/10, RAILGUN_RADIUS/2);
        if(railgun.cooldown < RAILGUN_SHOOT_TIME / 3 * 3)
            this.ctx.fillStyle = RAILGUN_LASER_COLOR;
        this.ctx.fillRect(RAILGUN_RADIUS*3/4, -RAILGUN_RADIUS/4, RAILGUN_RADIUS/10, RAILGUN_RADIUS/2);
        
        this.ctx.restore();
    }
    
    drawCanon(canon){
        this.ctx.save();
        this.setRelative(canon);
        
        this.ctx.fillStyle = ENEMY_COLOR_1;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, CANON_RADIUS*0.75, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.fillRect(0, -CANON_RADIUS/4, CANON_RADIUS*1.25, CANON_RADIUS/2);

        this.ctx.fillStyle = ENEMY_COLOR_2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, CANON_RADIUS*0.5, 0, 2 * Math.PI);
        this.ctx.fill();
        if(canon.cooldown < CANON_ALERT_TIME)
            this.ctx.fillStyle = CANON_ALERT_COLOR;
        this.ctx.fillRect(CANON_RADIUS*17/20, -CANON_RADIUS/4, CANON_RADIUS/10, CANON_RADIUS/2);
        
        this.ctx.restore();
    }

    drawBonus(bonus) {
        this.ctx.save();
        this.setRelative(bonus);

        this.ctx.fillStyle = BONUS_COLOR;
        this.ctx.globalAlpha = 0.5;
        this.ctx.beginPath()
        this.ctx.arc(0, 0, BONUS_RADIUS, 0, 2 * Math.PI);
        this.ctx.fill();

        this.ctx.restore();
    }
}