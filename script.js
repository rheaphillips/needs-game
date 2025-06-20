'use strict';

let background = document.querySelector('.background'), playerElem = document.querySelector('.player'), pause = document.querySelector('.pause'), resume = document.querySelector('.resume'), restart = document.querySelector('.restart'), overlay = document.querySelector(".overlay");

let border = 10, paused = true, speed = 0.75, count = 0, game, lastTime, totalTime = 0;
// the position of the origin (inital values as per the posiion of the wall and ground in the DOM)
let origin = [border, background.clientHeight - playerElem.clientHeight - border];

// converts into correct pixel values of the locations
const xCoord = function (x) {
    return `${origin[0] + x}px`;
}
const yCoord = function (y) {
    return `${origin[1] - y}px`;
}

const player = {
    
    vel: 0, // vertical velocity
    y: 0,
    g: 0.5, // gravitational acceleration
    
    jumping: false,
    jumpHoldTime: 0,
    maxJumpHold: 0.03, // Max time (in seconds) holding jump gives more height
    freeFall: false, // when the player is mid-air and it's velocity can no longer be increased

    // the velocity is only increased if it's been increased less than two times since the player got off the ground, and the user hasn't let go of the spacebar (indicated by the date of this.freeFall)
    jumpStart() {
        if (!this.jumping) {
            this.jumping = true;
            this.vel += 2; // initial jump impulse
            this.jumpHoldTime = 0;
        }
    },

    jumpHold() {
        if (this.jumping && this.jumpHoldTime < this.maxJumpHold) {
            this.vel += 3; // continue to increase velocity
            this.jumpHoldTime += 0.005;
        }
    },
    
    // updates the player's velocity and position
    updateVelocityAndPosition() {
        this.jumpHold(); // apply jump boost if key is held

        this.vel = this.vel - this.g; // updates the velocity using gravity
        this.y += this.vel; // updates position using velocity

        // resets at ground level
        if (this.y <= 0) {
            this.y = 0;
            this.vel = 0;
            this.jumping = false; // this enables the player to jump again
        } 

        playerElem.style.top = yCoord(this.y);
    }
}

class Obstacle {
  constructor(id) {
    this.x = 10;
    this.width = 50;
    this.id = document.getElementById(String(id));
  }

  restart(count) {
    let tries = 0;
    count++;
    do {
        this.x = Math.random()*1000 + 1000;
        tries++;
        if (tries > 1000) {
            console.warn("Could not find valid restart position.");
            break; // prevent infinite loop
        }
    } while (obstacles.some( obstacle => this == obstacle || Math.abs(this.x - obstacle.x) < 300));
  }

  move(speed, count) {
    this.x -= speed;
    this.id.style.left = xCoord(this.x);
    if (this.x < -this.width - 10) this.restart(count);
  }
}

const obstacles = [];
for (let i = 0; i < 3; i++) obstacles.push(new Obstacle(`${i + 1}`));
obstacles.forEach(obstacle => obstacle.restart(count));

// the velocity and postion, and the UI is updated in accordance, every 5 ms
const gameLoop = function () {
    let now = performance.now();
    totalTime += (now - lastTime) / 1000; // seconds
    lastTime = now;
    player.updateVelocityAndPosition();
    if (totalTime > 2) obstacles.forEach(obstacle => obstacle.move(speed, count));
    if (count == 3) {
        speed += 0.25
        count = 0;
    }
}

const jump = function (e) {
    if (e.key === " ") {
        if (paused) {
            paused = false;
            lastTime = performance.now();
            game = window.setInterval(gameLoop, 5);
        }
        player.jumpStart();
    }
}

// player jumps when spacebar is pressed
window.addEventListener('keydown', jump);

// pause game 
pause.addEventListener('click', function () {
    paused = true;
    window.clearInterval(game);
    window.removeEventListener("keydown", jump);
    overlay.classList.remove("hide");
    resume.classList.remove("hide");
    restart.classList.remove("hide");
});

resume.addEventListener('click', function () {
    paused = false;
    game = window.setInterval(gameLoop, 5);
    window.addEventListener("keydown", jump);
    overlay.classList.add("hide");
    resume.classList.add("hide");
    restart.classList.add("hide");
});