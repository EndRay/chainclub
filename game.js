class Game {
    width = 1280;
    height = 720;
    balls = [];
    canons = [];
    holding = false;
    pinPos

    update(delta) {

        for (let ball of this.balls) {
            if (this.holding) {
                const dx = this.pinPos[0] - ball.x;
                const dy = this.pinPos[1] - ball.y;
                const dist = Math.hypot(dx, dy);

                if (dist < ball.stringLength) {
                    ball.stringLength = dist;
                }
                if (dist > ball.stringLength) {
                    const angle = Math.atan2(ball.y - this.pinPos[1], ball.x - this.pinPos[0]);
                    ball.vx += dx / dist * delta * STRING_STRENGTH;
                    ball.vy += dy / dist * delta * STRING_STRENGTH;
                }
            }
            ball.update(delta);
        }

        for (let canon of this.canons) {
            let closestBall = null;
            for (let ball of this.balls) {
                const dist = Math.hypot(ball.x - canon.x, ball.y - canon.y);
                if (dist < CANON_RADIUS + BALL_RADIUS) {
                    this.canons.
                    console.log("canon destroyed")
                }
                if (closestBall === null || dist < Math.hypot(closestBall.x - canon.x, closestBall.y - canon.y)) {
                    closestBall = ball;
                }
            }
            canon.angle = Math.atan2(closestBall.y - canon.y, closestBall.x - canon.x);

            canon.update(delta);

            for(let missile of canon.missiles) {
                let closestBall = null;
                for (let ball of this.balls) {
                    if (closestBall === null || Math.hypot(ball.x - missile.x, ball.y - missile.y) < Math.hypot(closestBall.x - missile.x, closestBall.y - missile.y)) {
                        closestBall = ball;
                    }
                }

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

                missile.update(delta);
            }
        }
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