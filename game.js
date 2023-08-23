class Game {
    width = 1280;
    height = 720;
    balls = [];
    canons = [];
    missiles = [];
    particles = [];
    bonuses = [];
    holding = false;
    pinPos;
    canonSpawnCooldown = 0;
    bonusSpawnCooldown = BONUS_SPAWN_COOLDOWN;

    spawnParticles(x, y, amount, lifeTime, flyDistance, colors) {
        for (let i = 0; i < amount; ++i) {
            const angle = Math.random() * Math.PI * 2;
            const maxSpeed = flyDistance * (1 - PARTICLE_FRICTION) * FPS;
            const speed = Math.random() * maxSpeed;
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push(new Particle(x, y, angle, speed, color, lifeTime));
        }
    }

    removeCanon(canon) {
        const index = this.canons.indexOf(canon);
        if (index !== -1) {
            this.canons.splice(index, 1);
            this.spawnParticles(canon.x, canon.y, 300, 0.6, 90, FIRE_COLORS.concat([BALL_INVINCIBLE_COLOR]));
        }
    }

    removeBall(ball) {
        const index = this.balls.indexOf(ball);
        if (index !== -1) {
            this.balls.splice(index, 1);
            this.spawnParticles(ball.x, ball.y, 200, 0.6, 90, [ball.isInvincible() ? BALL_INVINCIBLE_COLOR : BALL_COLOR]);
        }
    }

    removeMissile(missile) {
        const index = this.missiles.indexOf(missile);
        if (index !== -1) {
            this.missiles.splice(index, 1);
            this.spawnParticles(missile.x, missile.y, 200, 0.5, 80, FIRE_COLORS);
        }
    }

    removeBonus(bonus) {
        const index = this.bonuses.indexOf(bonus);
        if (index !== -1) {
            this.bonuses.splice(index, 1);
        }
    }

    update(delta) {

        // update balls
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

        // rotate canons to the closest ball canons
        for (let i = this.canons.length - 1; i >= 0; --i) {
            const canon = this.canons[i];
            let closestBall = null;
            for (let ball of this.balls) {
                const dist = Math.hypot(ball.x - canon.x, ball.y - canon.y);
                if (closestBall === null || dist < Math.hypot(closestBall.x - canon.x, closestBall.y - canon.y)) {
                    closestBall = ball;
                }
            }
            if (closestBall === null)
                continue;
            canon.angle = Math.atan2(closestBall.y - canon.y, closestBall.x - canon.x);
        }
        // canons shoot missiles
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

        // rotate missiles to the closest ball
        for (let i = this.missiles.length - 1; i >= 0; --i) {
            const missile = this.missiles[i];
            let closestBall = null;
            for (let ball of this.balls) {
                if (closestBall === null || Math.hypot(ball.x - missile.x, ball.y - missile.y) < Math.hypot(closestBall.x - missile.x, closestBall.y - missile.y)) {
                    closestBall = ball;
                }
            }
            if (closestBall === null)
                continue;

            const targetAngle = Math.atan2(closestBall.y - missile.y, closestBall.x - missile.x);
            const angleDiff = targetAngle - missile.angle;
            if (angleDiff > Math.PI) {
                missile.angle += Math.PI * 2;
            }
            if (angleDiff < -Math.PI) {
                missile.angle -= Math.PI * 2;
            }

            if (angleDiff > 0) {
                missile.angle += Math.min(angleDiff, delta * MISSILE_ROTATION_SPEED);
            } else {
                missile.angle += Math.max(angleDiff, -delta * MISSILE_ROTATION_SPEED);
            }
        }
        // move missiles
        for (let i = this.missiles.length - 1; i >= 0; --i) {
            const missile = this.missiles[i];
            missile.fly_speed += MISSILE_ACCELERATION * delta;
            missile.x += missile.fly_speed * Math.cos(missile.angle) * delta;
            missile.y += missile.fly_speed * Math.sin(missile.angle) * delta;
        }

        // update particles
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

        // canon-ball collision
        for (let i = this.canons.length - 1; i >= 0; --i) {
            const canon = this.canons[i];
            for (let ball of this.balls) {

                const dist = Math.hypot(ball.x - canon.x, ball.y - canon.y);
                if (dist < CANON_RADIUS + BALL_RADIUS) {
                    for (const missile of canon.missiles)
                        this.removeMissile(missile);
                    this.removeCanon(canon);
                    ball.invincibility = BALL_INVINCIBILITY_TIME;
                    break;
                }
            }
        }

        // missile-missile collision
        for (let i = this.missiles.length - 1; i >= 0; --i) {
            const missile1 = this.missiles[i];
            for (let j = this.missiles.length - 1; j >= 0; --j) {
                const missile2 = this.missiles[j];
                if (missile1 === missile2) continue;
                const dist = Math.hypot(missile1.x - missile2.x, missile1.y - missile2.y);
                if (dist < MISSILE_RADIUS + MISSILE_RADIUS) {
                    this.removeMissile(missile1);
                    this.removeMissile(missile2);
                    break;
                }
            }
        }

        // ball-missile collision
        for (let i = this.balls.length - 1; i >= 0; --i) {
            const ball = this.balls[i];
            if (ball.isInvincible() > 0) continue;
            for (let j = this.missiles.length - 1; j >= 0; --j) {
                const missile = this.missiles[j];
                const dist = Math.hypot(ball.x - missile.x, ball.y - missile.y);
                if (dist < BALL_RADIUS + MISSILE_RADIUS) {
                    this.removeMissile(missile);
                    this.removeBall(ball);
                    break;
                }
            }
        }

        // ball-bonus collision
        for (let i = this.balls.length - 1; i >= 0; --i) {
            const ball = this.balls[i];
            for (let j = this.bonuses.length - 1; j >= 0; --j) {
                const bonus = this.bonuses[j];
                const dist = Math.hypot(ball.x - bonus.x, ball.y - bonus.y);
                if (dist < BALL_RADIUS + BONUS_RADIUS) {
                    this.removeBonus(bonus);
                    [ball.vx, ball.vy] = [ball.vy, -ball.vx];
                    const newBall = new Ball(ball.x, ball.y, -ball.vx, -ball.vy);
                    this.balls.push(newBall);
                    ball.invincibility = BALL_INVINCIBILITY_TIME;
                    newBall.invincibility = BALL_INVINCIBILITY_TIME;
                    break;
                }
            }
        }

        // spawn canon
        this.canonSpawnCooldown -= delta;
        if (this.canonSpawnCooldown <= 0) {
            this.canonSpawnCooldown += CANON_SPAWN_COOLDOWN;
            let x, y;
            let attempts = 0;
            do {
                x = Math.random() * this.width;
                y = Math.random() * this.height;
                let minDist = Infinity;
                for (let ball of this.balls)
                    minDist = Math.min(minDist, Math.hypot(ball.x - x, ball.y - y));
                if (minDist > CANON_SPAWN_MIN_DISTANCE)
                    break;
            } while (attempts++ < 10);
            this.canons.push(new Canon(x, y));
        }

        // spawn bonus
        this.bonusSpawnCooldown -= delta;
        if (this.bonusSpawnCooldown <= 0) {
            this.bonusSpawnCooldown += BONUS_SPAWN_COOLDOWN;
            let x, y;
            let attempts = 0;
            do {
                x = Math.random() * this.width;
                y = Math.random() * this.height;
                let minDist = Infinity;
                for (let ball of this.balls)
                    minDist = Math.min(minDist, Math.hypot(ball.x - x, ball.y - y));
                if (minDist > BONUS_SPAWN_MIN_DISTANCE)
                    break;
            } while (attempts++ < 10);
            this.bonuses.push(new Bonus(x, y));
        }

        // decrease invincibility
        for (const ball of this.balls)
            ball.invincibility -= delta;
    }

    draw(ctx) {
        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.fillRect(0, 0, this.width, this.height);

        this.balls.forEach(ball => {
            if (this.holding) {
                ctx.beginPath();
                ctx.strokeStyle = ball.isInvincible() ? BALL_INVINCIBLE_COLOR : BALL_COLOR;
                ctx.moveTo(this.pinPos[0], this.pinPos[1]);
                ctx.lineTo(ball.x, ball.y);
                ctx.stroke();
            }

            ball.draw(ctx);
        });

        this.canons.forEach(canon => {
            canon.draw(ctx);
        });

        this.missiles.forEach(missile => {
            missile.draw(ctx);
        });

        this.particles.forEach(particle => {
            particle.draw(ctx);
        });
        this.bonuses.forEach(bonus => {
            bonus.draw(ctx);
        });
    }

    mousePressed(mouseX, mouseY) {
        this.holding = true;
        this.pinPos = [mouseX, mouseY];
        for (let ball of this.balls) {
            ball.stringLength = Math.hypot(ball.x - mouseX, ball.y - mouseY);
        }
    }

    mouseReleased(mouseX, mouseY) {
        this.holding = false;
    }
}