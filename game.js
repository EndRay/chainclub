function particleSpeedToDistance(speed){
    return speed / FPS / (1 - PARTICLE_FRICTION);
}

function particleDistanceToSpeed(distance){
    return distance * FPS * (1 - PARTICLE_FRICTION);
}

function distanceToRay(ray, x, y){
    const distance = Math.abs((x - ray.x) * Math.sin(ray.angle) - (y - ray.y) * Math.cos(ray.angle));
    const directionDistance = (x - ray.x) * Math.cos(ray.angle) + (y - ray.y) * Math.sin(ray.angle);

    if(directionDistance > 0)
        return distance;
    return Math.hypot(ray.x - x, ray.y - y);
}


class Game {
    width = 1600;
    height = 900;

    LASERS_LENGTH = Math.hypot(this.width, this.height);

    balls = [];
    canons = [];
    railguns = [];
    railgunLasers = [];
    missiles = [];
    particles = [];
    bonuses = [];
    matrixBonuses = [];
    holding = false;
    pinPos;

    canonSpawnCooldown = 0;
    railgunSpawnCooldown = RAILGUN_SPAWN_COOLDOWN;
    bonusSpawnCooldown = BONUS_SPAWN_COOLDOWN;
    matrixBonusSpawnCooldown = MATRIX_BONUS_SPAWN_COOLDOWN;

    matrixDuration = 0;

    score = 0;
    highscore = 0;

    constructor() {
        this.balls.push(new Ball(this.width / 2, this.height / 2));
        this.highscore = Number(localStorage.getItem("highscore")) || 0;
    }

    throwParticle(fromX, fromY, toX, toY, flyTime, color) {
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const flyDistance = Math.hypot(toX - fromX, toY - fromY);
        const steps = flyTime * FPS;
        const coefficient = (1 - Math.pow(PARTICLE_FRICTION, steps)) / (1 - PARTICLE_FRICTION);
        const speed = flyDistance * FPS / coefficient;
        this.particles.push(new Particle(fromX, fromY, angle, speed, color, flyTime));
    }

    spawnParticles(x, y, amount, lifeTime, flyDistance, colors, radius=0, direction, directionDistance) {
        const maxSpeed = particleDistanceToSpeed(flyDistance);
        const directionSpeed = particleDistanceToSpeed(directionDistance);
        for (let i = 0; i < amount; ++i) {
            const randomAngle = Math.random() * Math.PI * 2;
            const randomSpeed = Math.random() * maxSpeed;
            let angle, speed;
            if(direction === undefined) {
                angle = randomAngle;
                speed = randomSpeed
            }
            else {
                // const randomDirectedAngle = direction + (Math.random() - 0.5) * directionAngle;
                // const randomDirectedSpeed = Math.random() * directionDistance;
                const randomDirectedAngle = direction;
                const randomDirectedSpeed = directionSpeed;

                const [dx1, dy1] = [Math.cos(randomAngle) * randomSpeed, Math.sin(randomAngle) * randomSpeed];
                const [dx2, dy2] = [Math.cos(randomDirectedAngle) * randomDirectedSpeed, Math.sin(randomDirectedAngle) * randomDirectedSpeed];

                angle = Math.atan2(dy1 + dy2, dx1 + dx2);
                speed = Math.hypot(dx1 + dx2, dy1 + dy2);
            }
            const color = colors[Math.floor(Math.random() * colors.length)];

            const offset = Math.random() * radius;
            const newX = x + Math.cos(randomAngle) * offset;
            const newY = y + Math.sin(randomAngle) * offset;

            this.particles.push(new Particle(newX, newY, angle, speed, color, lifeTime));
        }
    }

    destroyRailgun(railgun, destroySource) {
        const index = this.railguns.indexOf(railgun);
        if (index !== -1) {
            this.railguns.splice(index, 1);
            this.spawnParticles(railgun.x, railgun.y, 400, 0.6, 90, FIRE_COLORS.concat(DESTROY_SOURCE_ADDITIONAL_COLORS[destroySource] || []));
        }
    }

    destroyCanon(canon, destroySource, destroySourceObject) {
        for (const missile of canon.missiles)
            this.destroyMissile(missile);

        const index = this.canons.indexOf(canon);
        if (index !== -1) {
            this.canons.splice(index, 1);

            const colors = FIRE_COLORS.concat(DESTROY_SOURCE_ADDITIONAL_COLORS[destroySource] || []);

            if(destroySource === "ball"){
                const direction = Math.atan2(destroySourceObject.vy, destroySourceObject.vx);
                this.spawnParticles(canon.x, canon.y, 300, 0.6, 90,
                    colors,
                    CANON_RADIUS,
                    direction, particleSpeedToDistance(Math.hypot(destroySourceObject.vy, destroySourceObject.vx)) * 0.15);
            }
            else {
                this.spawnParticles(canon.x, canon.y, 300, 0.6, 90,
                    colors, CANON_RADIUS);
            }


        }
    }

    destroyBall(ball) {
        const index = this.balls.indexOf(ball);
        if (index !== -1) {
            this.balls.splice(index, 1);
            this.spawnParticles(ball.x, ball.y, 200, 1, 60,
                [ball.isInvincible() ? BALL_INVINCIBLE_COLOR : BALL_COLOR],
                BALL_RADIUS,
                Math.atan2(ball.vy, ball.vx), particleSpeedToDistance(Math.hypot(ball.vy, ball.vx)) * 0.2);
        }
    }

    destroyMissile(missile) {
        const index = this.missiles.indexOf(missile);
        if (index !== -1) {
            this.missiles.splice(index, 1);

            
            this.spawnParticles(missile.x, missile.y, 200, 0.6, 80, FIRE_COLORS,
                MISSILE_RADIUS,
                missile.angle, particleSpeedToDistance(missile.flySpeed) * 0.5);
        }
    }

    destroyBonus(bonus) {
        const index = this.bonuses.indexOf(bonus);
        if (index !== -1) {
            this.bonuses.splice(index, 1);
        }
    }

    destroyMatrixBonus(bonus) {
        const index = this.matrixBonuses.indexOf(bonus);
        if (index !== -1) {
            this.matrixBonuses.splice(index, 1);
        }
    }

    mousePressed(mouseX, mouseY) {
        this.holding = true;
        this.pinPos = [mouseX, mouseY];
        for (let ball of this.balls) {
            ball.stringLength = Math.hypot(ball.x - mouseX, ball.y - mouseY);
        }
    }

    mouseReleased() {
        this.holding = false;
    }

    dangerLevel(){
        let distance = Infinity
        for(const ball of this.balls){
            for(const missile of this.missiles){
                distance = Math.min(distance, Math.hypot(ball.x - missile.x, ball.y - missile.y) - BALL_RADIUS + MISSILE_RADIUS);
            }
            for(const railgun of this.railguns){
                if(railgun.isAiming()){
                    distance = Math.min(distance, distanceToRay(
                        {
                            x: railgun.x,
                            y: railgun.y,
                            angle: railgun.angle
                        }, ball.x, ball.y) - BALL_RADIUS);
                }
            }
            for(const laser of this.railgunLasers){
                distance = Math.min(distance, distanceToRay(laser, ball.x, ball.y) - BALL_RADIUS);
            }
        }
        let level = 1 - (distance - MATRIX_MIN_DANGER_DISTANCE) / (MATRIX_MAX_DANGER_DISTANCE - MATRIX_MIN_DANGER_DISTANCE);
        return Math.max(0, Math.min(1, level));
    }

    update(delta) {
        if(this.matrixDuration > 0){
            const slowLevel = this.dangerLevel();
            delta *= Math.pow(MATRIX_SLOW, slowLevel);
        }

        this.updateBalls(delta);
        this.decreaseRailgunLasersLifetime(delta);

        this.rotateCanons(delta);
        this.rotateRailguns(delta);

        this.shootCanons(delta);
        this.shootRailguns(delta);

        this.rotateMissiles(delta);
        this.moveMissiles(delta);
        this.updateParticles(delta);

        this.handleCollisions();
        this.handleSpawn(delta);

        this.updateMatrixBonusesLifeTime(delta);

        this.createTrail(delta);
        this.createRailgunShootParticles(delta);

        this.decreaseInvincibility(delta);
        this.decreaseMatrixDuration(delta);

        this.updateScore(delta);
    }

    updateMatrixBonusesLifeTime(delta) {
        for (const bonus of this.matrixBonuses) {
            bonus.lifeTime -= delta;
            if (bonus.lifeTime <= 0) {
                this.destroyMatrixBonus(bonus);
            }
        }
    }

    decreaseMatrixDuration(delta) {
        if (this.matrixDuration > 0) {
            this.matrixDuration -= delta;
            if (this.matrixDuration <= 0) {
                this.matrixDuration = 0;
            }
        }
    }

    handleSpawn(delta) {
        this.spawnCanon(delta);
        this.spawnRailgun(delta);
        this.spawnBonus(delta);
        this.spawnMatrixBonus(delta);
    }

    handleCollisions() {
        this.collideCanonBall();

        this.collideMissileMissile();
        this.collideMissileRailgun();
        this.collideBallMissile();

        this.collideRailgunLaserBall();
        this.collideRailgunLaserCanon();
        this.collideRailgunLaserMissile();
        this.collideRailgunLaserRailgun();

        this.collideBallBonus();
        this.collideBallMatrixBonus();
    }

    isRailgunLaserCollide(laser, x, y, radius){
        return distanceToRay(laser, x, y) < radius;
    }

    collideMissileRailgun(){
        for (let i = this.railguns.length - 1; i >= 0; --i) {
            const railgun = this.railguns[i];
            for (let j = this.missiles.length - 1; j >= 0; --j) {
                const missile = this.missiles[j];
                const dist = Math.hypot(railgun.x - missile.x, railgun.y - missile.y);
                if (dist < RAILGUN_RADIUS + MISSILE_RADIUS) {
                    this.destroyMissile(missile);
                    this.destroyRailgun(railgun);
                    break;
                }
            }
        }
    }

    collideRailgunLaserBall(){
        for (const railgunLaser of this.railgunLasers) {
            for(let i = this.balls.length - 1; i >= 0; --i){
                const ball = this.balls[i];
                if(this.isRailgunLaserCollide(railgunLaser, ball.x, ball.y, BALL_RADIUS)) {
                    this.destroyBall(ball);
                }
            }
        }
    }

    collideRailgunLaserCanon(){
        for (const railgunLaser of this.railgunLasers) {
            for(let i = this.canons.length - 1; i >= 0; --i){
                const canon = this.canons[i];
                if(this.isRailgunLaserCollide(railgunLaser, canon.x, canon.y, CANON_RADIUS)) {
                    this.destroyCanon(canon, "railgunLaser");
                }
            }
        }
    }

    collideRailgunLaserMissile(){
        for (const railgunLaser of this.railgunLasers) {
            for(let i = this.missiles.length - 1; i >= 0; --i){
                const missile = this.missiles[i];
                if(this.isRailgunLaserCollide(railgunLaser, missile.x, missile.y, MISSILE_RADIUS)) {
                    this.destroyMissile(missile);
                }
            }
        }
    }

    collideRailgunLaserRailgun(){
        for (const railgunLaser of this.railgunLasers) {
            for(let i = this.railguns.length - 1; i >= 0; --i){
                const railgun = this.railguns[i];
                if(railgunLaser.owner !== railgun && this.isRailgunLaserCollide(railgunLaser, railgun.x, railgun.y, RAILGUN_RADIUS)) {
                    this.destroyRailgun(railgun);
                }
            }
        }
    }

    updateBalls(delta) {
        for (let ball of this.balls) {
            if (this.holding) {
                const dx = this.pinPos[0] - ball.x;
                const dy = this.pinPos[1] - ball.y;
                const dist = Math.hypot(dx, dy);

                if (dist < ball.stringLength) {
                    ball.stringLength = dist;
                }
                if (dist > ball.stringLength) {
                    ball.vx += dx / dist * delta * STRING_STRENGTH;
                    ball.vy += dy / dist * delta * STRING_STRENGTH;
                }
            }

            // update
            ball.x += ball.vx * delta;
            ball.y += ball.vy * delta;

            if (ball.vx === 0 && ball.vy === 0) {
                ball.vx = 1;
            }
            const speed = Math.hypot(ball.vx, ball.vy);
            if (speed < BALL_MIN_SPEED) {
                ball.vx += ball.vx / speed * BALL_ACCELERATION * delta;
                ball.vy += ball.vy / speed * BALL_ACCELERATION * delta;
            }
            if (speed > BALL_MAX_SPEED) {
                ball.vx -= ball.vx / speed * BALL_ACCELERATION * delta;
                ball.vy -= ball.vy / speed * BALL_ACCELERATION * delta;
            }
            if (ball.x < 0) {
                ball.vx = Math.abs(ball.vx);
            }
            if (ball.x > canvas.width) {
                ball.vx = -Math.abs(ball.vx);
            }
            if (ball.y < 0) {
                ball.vy = Math.abs(ball.vy);
            }
            if (ball.y > canvas.height) {
                ball.vy = -Math.abs(ball.vy);
            }
        }
    }

    rotateToClosestBall(obj, rotationSpeed, delta) {
        let closestBall = null;
        for (let ball of this.balls) {
            if (closestBall === null || Math.hypot(ball.x - obj.x, ball.y - obj.y) < Math.hypot(closestBall.x - obj.x, closestBall.y - obj.y)) {
                closestBall = ball;
            }
        }
        if (closestBall === null)
            return;

        const targetAngle = Math.atan2(closestBall.y - obj.y, closestBall.x - obj.x);
        const angleDiff = targetAngle - obj.angle;
        if (angleDiff > Math.PI) {
            obj.angle += Math.PI * 2;
        }
        if (angleDiff < -Math.PI) {
            obj.angle -= Math.PI * 2;
        }

        if (angleDiff > 0) {
            obj.angle += Math.min(angleDiff, delta * rotationSpeed);
        } else {
            obj.angle += Math.max(angleDiff, -delta * rotationSpeed);
        }
    }

    rotateCanons(delta) {
        for (let i = this.canons.length - 1; i >= 0; --i) {
            const canon = this.canons[i];
            this.rotateToClosestBall(canon, CANON_ROTATION_SPEED, delta);
        }
    }

    rotateRailguns(delta) {
        for (let i = this.railguns.length - 1; i >= 0; --i) {
            const railgun = this.railguns[i];
            if(!railgun.isShooting())
                this.rotateToClosestBall(railgun, RAILGUN_ROTATION_SPEED, delta);
        }
    }

    shootCanons(delta) {
        for (let i = this.canons.length - 1; i >= 0; --i) {
            const canon = this.canons[i];
            canon.cooldown -= delta;
            if (canon.cooldown <= 0) {
                canon.cooldown += CANON_COOLDOWN;
                const offset_x = Math.cos(canon.angle) * CANON_RADIUS;
                const offset_y = Math.sin(canon.angle) * CANON_RADIUS;
                const new_missile = new Missile(canon.x + offset_x, canon.y + offset_y, canon.angle);
                this.missiles.push(new_missile);
                canon.missiles.push(new_missile);
            }
        }
    }

    spawnRailgunLaserParticles(x, y, angle) {
        const STEP = 1 / RAILGUN_LASER_PARTICLES_AMOUNT;
        for(let pos = 0; pos < this.LASERS_LENGTH; pos += STEP) {
            const particleX = x + Math.cos(angle) * pos;
            const particleY = y + Math.sin(angle) * pos;
            this.spawnParticles(particleX, particleY, 1, 0.5, RAILGUN_LASER_PARTICLES_WIDTH, [RAILGUN_LASER_COLOR]);
        }
    }

    shootRailguns(delta) {
        for (let i = this.railguns.length - 1; i >= 0; --i) {
            const railgun = this.railguns[i];
            railgun.cooldown -= delta;
            if (railgun.cooldown <= 0) {
                railgun.cooldown += RAILGUN_COOLDOWN;
                this.railgunLasers.push({
                    x: railgun.x,
                    y: railgun.y,
                    angle: railgun.angle,
                    lifeTime: RAILGUN_LASER_LIFETIME,
                    owner: railgun,
                });
                this.spawnRailgunLaserParticles(railgun.x, railgun.y, railgun.angle);
            }
        }
    }

    rotateMissiles(delta) {
        for (let i = this.missiles.length - 1; i >= 0; --i) {
            const missile = this.missiles[i];
            this.rotateToClosestBall(missile, MISSILE_ROTATION_SPEED, delta);
        }
    }

    moveMissiles(delta) {
        for (let i = this.missiles.length - 1; i >= 0; --i) {
            const missile = this.missiles[i];
            missile.flySpeed += MISSILE_ACCELERATION * delta;
            missile.x += missile.flySpeed * Math.cos(missile.angle) * delta;
            missile.y += missile.flySpeed * Math.sin(missile.angle) * delta;
        }
    }

    updateParticles(delta) {
        for (let i = this.particles.length - 1; i >= 0; --i) {
            const particle = this.particles[i];
            if (particle.lifeTime <= 0) {
                this.particles.splice(this.particles.indexOf(particle), 1);
                continue;
            }
            particle.x += particle.vx * delta;
            particle.y += particle.vy * delta;
            particle.lifeTime -= delta;
            particle.vx *= PARTICLE_FRICTION;
            particle.vy *= PARTICLE_FRICTION;
        }
    }

    collideCanonBall() {
        for (let i = this.canons.length - 1; i >= 0; --i) {
            const canon = this.canons[i];
            for (let ball of this.balls) {

                const dist = Math.hypot(ball.x - canon.x, ball.y - canon.y);
                if (dist < CANON_RADIUS + BALL_RADIUS) {
                    this.destroyCanon(canon, "ball", ball);
                    ball.invincibility = BALL_INVINCIBILITY_TIME;
                    break;
                }
            }
        }
    }

    collideMissileMissile() {
        for (let i = this.missiles.length - 1; i >= 0; --i) {
            if (i >= this.missiles.length) continue;
            const missile1 = this.missiles[i];
            for (let j = this.missiles.length - 1; j >= 0; --j) {
                const missile2 = this.missiles[j];
                if (missile1 === missile2) continue;
                const dist = Math.hypot(missile1.x - missile2.x, missile1.y - missile2.y);
                if (dist < MISSILE_RADIUS + MISSILE_RADIUS) {
                    this.destroyMissile(missile1);
                    this.destroyMissile(missile2);
                    break;
                }
            }
        }
    }

    collideBallMissile() {
        for (let i = this.balls.length - 1; i >= 0; --i) {
            const ball = this.balls[i];
            if (ball.isInvincible() > 0) continue;
            for (let j = this.missiles.length - 1; j >= 0; --j) {
                const missile = this.missiles[j];
                const dist = Math.hypot(ball.x - missile.x, ball.y - missile.y);
                if (dist < BALL_RADIUS + MISSILE_RADIUS) {
                    this.destroyMissile(missile);
                    this.destroyBall(ball);
                    break;
                }
            }
        }
    }

    collideBallBonus() {
        for (let i = this.balls.length - 1; i >= 0; --i) {
            const ball = this.balls[i];
            for (let j = this.bonuses.length - 1; j >= 0; --j) {
                const bonus = this.bonuses[j];
                const dist = Math.hypot(ball.x - bonus.x, ball.y - bonus.y);
                if (dist < BALL_RADIUS + BONUS_RADIUS) {
                    this.destroyBonus(bonus);
                    [ball.vx, ball.vy] = [ball.vy, -ball.vx];
                    const newBall = new Ball(ball.x, ball.y, -ball.vx, -ball.vy);
                    this.balls.push(newBall);
                    ball.invincibility = BALL_INVINCIBILITY_TIME;
                    newBall.invincibility = BALL_INVINCIBILITY_TIME;
                    break;
                }
            }
        }
    }

    collideBallMatrixBonus() {
        for (let i = this.balls.length - 1; i >= 0; --i) {
            const ball = this.balls[i];
            for (let j = this.matrixBonuses.length - 1; j >= 0; --j) {
                const bonus = this.matrixBonuses[j];
                const dist = Math.hypot(ball.x - bonus.x, ball.y - bonus.y);
                if (dist < BALL_RADIUS + MATRIX_BONUS_RADIUS) {
                    this.destroyMatrixBonus(bonus);
                    this.matrixDuration = MATRIX_BONUS_DURATION;
                    break;
                }
            }
        }
    }

    chooseRandomPosition(minDistanceToBalls) {
        let x, y;
        let attempts = 0;
        do {
            x = Math.random() * this.width;
            y = Math.random() * this.height;
            let minDist = Infinity;
            for (let ball of this.balls)
                minDist = Math.min(minDist, Math.hypot(ball.x - x, ball.y - y));
            if (minDist > minDistanceToBalls)
                break;
        } while (attempts++ < 10);
        return [x, y];
    }

    spawnCanon(delta) {
        this.canonSpawnCooldown -= delta;
        if (this.canonSpawnCooldown <= 0) {
            this.canonSpawnCooldown += CANON_SPAWN_COOLDOWN;
            const [x, y] = this.chooseRandomPosition(CANON_SPAWN_MIN_DISTANCE);
            this.canons.push(new Canon(x, y));
        }
    }

    spawnRailgun(delta) {
        this.railgunSpawnCooldown -= delta;
        if (this.railgunSpawnCooldown <= 0) {
            this.railgunSpawnCooldown += RAILGUN_SPAWN_COOLDOWN;
            const [x, y] = this.chooseRandomPosition(RAILGUN_SPAWN_MIN_DISTANCE);
            this.railguns.push(new Railgun(x, y));
        }
    }

    spawnBonus(delta) {
        this.bonusSpawnCooldown -= delta;
        if (this.bonusSpawnCooldown <= 0) {
            this.bonusSpawnCooldown += BONUS_SPAWN_COOLDOWN;
            const [x, y] = this.chooseRandomPosition(BONUSES_SPAWN_MIN_DISTANCE);
            this.bonuses.push(new Bonus(x, y));
        }
    }

    spawnMatrixBonus(delta) {
        this.matrixBonusSpawnCooldown -= delta;
        if (this.matrixBonusSpawnCooldown <= 0) {
            this.matrixBonusSpawnCooldown += MATRIX_BONUS_SPAWN_COOLDOWN;
            const [x, y] = this.chooseRandomPosition(BONUSES_SPAWN_MIN_DISTANCE);
            this.matrixBonuses.push(new MatrixBonus(x, y));
        }
    }

    createTrail(delta) {
        for (const ball of this.balls) {
            let amount = BALL_TRAIL_DENSITY * delta;
            while (amount > 0) {
                if (amount >= 1) {
                    amount -= 1;
                } else {
                    if (Math.random() >= amount) break;
                    amount -= 1;
                }
                // choose random pos inside ball
                let x, y;
                {
                    const angle = Math.random() * 2 * Math.PI;
                    const dist = Math.random() * BALL_RADIUS;
                    x = ball.x + Math.cos(angle) * dist;
                    y = ball.y + Math.sin(angle) * dist;
                }
                this.particles.push(
                    new Particle(x, y,
                        Math.random() * 2 * Math.PI,
                        Math.random() * BALL_RADIUS * BALL_TRAIL_PARTICLE_SPEED,
                        ball.isInvincible() ? BALL_INVINCIBLE_COLOR : BALL_COLOR,
                        BALL_TRAIL_PARTICLE_LIFETIME));
            }
        }
    }

    spawnRailgunShootParticles(x, y, angle, delta) {
        const STEP = 1 / RAILGUN_AIM_PARTICLES_DENSITY;
        for(let pos = 0; pos < this.LASERS_LENGTH; pos += STEP) {
            if(Math.random() > delta)
                continue;
            const particleEndX = x + Math.cos(angle) * pos;
            const particleEndY = y + Math.sin(angle) * pos;

            let particleStartX = particleEndX;
            let particleStartY = particleEndY;

            if(Math.random() < 0.5){ // from left
                particleStartX -= Math.cos(angle + Math.PI / 2) * RAILGUN_AIM_PARTICLES_WIDTH;
                particleStartY -= Math.sin(angle + Math.PI / 2) * RAILGUN_AIM_PARTICLES_WIDTH;
            }
            else{ // from right
                particleStartX += Math.cos(angle + Math.PI / 2) * RAILGUN_AIM_PARTICLES_WIDTH;
                particleStartY += Math.sin(angle + Math.PI / 2) * RAILGUN_AIM_PARTICLES_WIDTH;
            }

            this.throwParticle(
                particleStartX, particleStartY,
                particleEndX, particleEndY,
                1.5, RAILGUN_LASER_COLOR);
        }
    }

    createRailgunShootParticles(delta){
        for(const railgun of this.railguns){
            if(railgun.isShooting()){
                this.spawnRailgunShootParticles(railgun.x, railgun.y, railgun.angle, delta);
            }
        }
    }

    decreaseInvincibility(delta) {
        for (const ball of this.balls)
            ball.invincibility -= delta;
    }

    updateScore(delta) {
        if(this.balls.length === 0)
            return;
        this.score += delta;
        if (Math.floor(this.score) > this.highscore) {
            this.highscore = Math.floor(this.score);
            localStorage.setItem('highscore', this.highscore.toString());
        }
    }

    decreaseRailgunLasersLifetime(delta){
        for (let i = this.railgunLasers.length - 1; i >= 0; --i) {
            const laser = this.railgunLasers[i];
            laser.lifeTime -= delta;
            if(laser.lifeTime <= 0)
                this.railgunLasers.splice(i, 1);
        }
    }
}