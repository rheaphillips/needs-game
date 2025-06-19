'use strict';

let background = document.querySelector('.background'), playerElem = document.querySelector('.player');
let border = 10;

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
    count: 0, // number of spacebar clicks
    jumping: false,
    jumpHoldTime: 0,
    maxJumpHold: 0.3, // Max time (in seconds) holding jump gives more height

    freeFall: false, // when the player is mid-air and it's velocity can no longer be increased


    // the velocity is only increased if it's been increased less than two times since the player got off the ground, and the user hasn't let go of the spacebar (indicated by the date of this.freeFall)
    jumpStart() {
        if (this.count < 2) {
            this.count++;
            this.jumping = true;
            this.jumpHoldTime = 0;
            this.vel += 500; // initial jump impulse
        }
    },

    jumpHold(dt) {
        if (this.jumping && this.jumpHoldTime < this.maxJumpHold) {
            this.vel += 250 * dt; // continue to increase velocity
            this.jumpHoldTime += dt;
        }
    },

    jumpEnd() {
        this.jumping = false;
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
    } while (obstacles.some( obstacle => this != obstacle && Math.abs(this.x - obstacle.x) < 400));
  }

  move() {
    this.x--;
    this.id.style.left = xCoord(this.x);
    if (this.x < -this.width - 10) {
        this.restart();
    }
  }
}

const obstacles = [];

for (let i = 0; i < 3; i++) {
    obstacles.push(new Obstacle(`${i + 1}`));
}

// player jumps when spacebar is pressed
window.addEventListener('keydown', function (e) {
    if (e.key === " ") {
        player.jumpStart();
    }
});

// player stops jumping when spacebar is released
window.addEventListener('keyup', function (e) {
    if (e.key === " ") {
        player.jumpEnd();
    }
});

// the velocity and postion, and the UI is updated in accordance, every 10 ms
let lastTime = performance.now();
window.setInterval(function () {
    let now = performance.now();
    let dt = (now - lastTime) / 1000; // seconds
    lastTime = now;
    player.updateVelocityAndPosition(dt);
    obstacles.forEach(obstacle => obstacle.move());
}, 5);
    