'use strict';

let background = document.querySelector('.background'), playerElem = document.querySelector('.player');
let border = 10;
let paused = true;

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
    g: 700, // gravitational acceleration
    
    jumping: false,
    jumpHoldTime: 0,
    maxJumpHold: 0.01, // Max time (in seconds) holding jump gives more height
    freeFall: false, // when the player is mid-air and it's velocity can no longer be increased


    // the velocity is only increased if it's been increased less than two times since the player got off the ground, and the user hasn't let go of the spacebar (indicated by the date of this.freeFall)
    jumpStart() {
        if (!this.jumping) {
            this.jumping = true;
            this.vel += 100; // initial jump impulse
            this.jumpHoldTime = 0;
        }
    },

    jumpHold(dt) {
        if (this.jumping && this.jumpHoldTime < this.maxJumpHold) {
            this.vel += 200; // continue to increase velocity
            this.jumpHoldTime += dt;
        }
    },
    
    // updates the player's velocity and position
    updateVelocityAndPosition(dt) {
        this.jumpHold(dt); // apply jump boost if key is held

        this.vel = this.vel - this.g*0.01; // updates the velocity using gravity
        this.y += this.vel * dt; // updates position using velocity

        // resets at ground level
        if (this.y <= 0) {
            this.y = 0;
            this.vel = 0;
            this.count = 0;
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
  restart() {
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

  move() {
    this.x -= 1;
    this.id.style.left = xCoord(this.x);
    if (this.x < -this.width - 10) this.restart();
  }
}

const obstacles = [];
for (let i = 0; i < 3; i++) obstacles.push(new Obstacle(`${i + 1}`));
obstacles.forEach(obstacle => obstacle.restart());

// player jumps when spacebar is pressed
window.addEventListener('keydown', function (e) {
    if (e.key === " ") {
        if (paused) paused = false;
        player.jumpStart();
    }
});

// the velocity and postion, and the UI is updated in accordance, every 10 ms
let lastTime = performance.now();
let totalTime = 0;
window.setInterval(function () {
    let now = performance.now();
    let dt = (now - lastTime) / 1000; // seconds
    lastTime = now;
    if (paused) {
        
    } else {
        totalTime += dt;
        player.updateVelocityAndPosition(dt);
        if (totalTime > 2) {
            obstacles.forEach(obstacle => obstacle.move());
        }
    }
}, 5);