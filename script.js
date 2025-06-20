'use strict';

let background = document.querySelector('.background'), playerElem = document.querySelector('.player'), pauseBtn = document.querySelector('.pause'), resumeBtn = document.querySelector('.resume'), restartBtn = document.querySelector('.restart'), overlay = document.querySelector(".overlay");

let border = 10, speed = 0.75, count = 0, game, lastTime, totalTime = 0;
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
    
    g: 0.5, // gravitational acceleration
    maxJumpHold: 0.03, // Max time (in seconds) holding jump gives more height
    vel: 0, // vertical velocity
    y: 0,
    jumping: false,
    jumpHoldTime: 0,

    // provides the initial jump impulse
    jumpStart() {
        if (!this.jumping) {
            this.jumping = true;
            this.vel += 2;
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
        if (this.y <= 0) this.reset(); 
        else playerElem.style.top = yCoord(this.y);
    },

    reset() {
        this.y = 0;
        this.vel = 0;
        this.jumping = false; // this enables the player to jump again
        this.jumpHoldTime = 0;
        playerElem.style.top = yCoord(this.y);
    }
}

class Obstacle {
  constructor(id) {
    this.x = 10;
    this.width = 50;
    this.id = document.getElementById(String(id));
  }

  respawn() {
    let tries = 0;
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
    if (this.x < -this.width - 10) {
        count++;
        this.respawn();
    }
  }
}

const obstacles = [];
for (let i = 0; i < 3; i++) obstacles.push(new Obstacle(`${i + 1}`));

// player jumps when spacebar is pressed
const jump = (e) => {if (e.key === " ") player.jumpStart()};

// pause game
const pause = function () {
    window.clearInterval(game);
    window.removeEventListener("keydown", jump);
    overlay.classList.remove("hide");
    resumeBtn.classList.remove("hide");
    restartBtn.classList.remove("hide");
}

// resume paused game
const resume = function () {
    // hide overlay and pause menu buttons
    overlay.classList.add("hide");
    resumeBtn.classList.add("hide");
    restartBtn.classList.add("hide");

    // start detecting key presses to trigger jumps when spacebar is pressed
    window.addEventListener('keydown', jump);

    // start game loop
    lastTime = performance.now();
    game = window.setInterval(gameLoop, 5);
}

const restart = function () {
    // Reset obstacles and player
    obstacles.forEach(obstacle => obstacle.respawn());
    player.reset();
    // exit pause menu and add event listners
    resume();
}

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

pauseBtn.addEventListener('click', pause);
resumeBtn.addEventListener('click', resume);
restartBtn.addEventListener('click', restart);

restart();