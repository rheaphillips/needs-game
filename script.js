'use strict';

let background = document.querySelector('.background'), playerElem = document.querySelector('.player'), pauseBtn = document.querySelector('.pause'), resumeBtn = document.querySelector('.resume'), restartBtn = document.querySelector('.restart'), gameOverElem = document.querySelector('.gameOver'), overlay = document.querySelector(".overlay"), scoreElem = document.querySelector(".score"), highscoreElem = document.querySelector(".highscore");

let border = 10, speed = 1.75, score = 0, highscore = 0, game;
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
    
    g: 0.07, // gravitational acceleration
    maxJumpHold: 0.05, // Max time (in seconds) holding jump gives more height
    vel: 0, // vertical velocity
    y: 0,
    jumping: false,
    jumpHoldTime: 0,

    // provides the initial jump impulse
    jumpStart() {
        if (!this.jumping) {
            this.jumping = true;
            this.vel += 0.75;
        }
    },

    jumpHold() {
        if (this.jumping && this.jumpHoldTime < this.maxJumpHold) {
            this.vel += 0.5; // continue to increase velocity
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
    this.height = 50;
    this.id = document.getElementById(String(id));
  }

  respawn() {
    let tries = 0;
    do {
        this.x = Math.random()*1000 + 1500;
        tries++;
        if (tries > 10000) {
            console.warn("Could not find valid restart position.");
            break; // prevent infinite loop
        }
    } while (obstacles.some( obstacle => this == obstacle || Math.abs(this.x - obstacle.x) < 800));
  }

  move(speed) {
    this.x -= speed;
    this.id.style.left = xCoord(this.x);
    if (this.x < -this.width - 10) {
        score++;
        scoreElem.textContent = score;
        this.respawn();
    }
    this.collision();
  }

  collision() {
    if (this.x > 60 && this.x < 180 && player.y < this.height) gameOver();
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
    gameOverElem.classList.add("hide");

    // start detecting key presses to trigger jumps when spacebar is pressed
    window.addEventListener('keydown', jump);

    // start game loop
    game = window.setInterval(gameLoop, 5);
}

const restart = function () {
    // reset displayed score and update displayed highscore
    scoreElem.textContent = score;
    highscoreElem.textContent = highscore;

    // Reset obstacles and player
    obstacles.forEach(obstacle => obstacle.respawn());
    player.reset();
    // exit pause menu and add event listners
    resume();
}

const gameOver = function() {
    if (highscore < score) highscore = score;
    score = 0;

    window.clearInterval(game);
    window.removeEventListener("keydown", jump);
    overlay.classList.remove("hide");
    restartBtn.classList.remove("hide");
    gameOverElem.classList.remove("hide");
}

// the velocity and postion, and the UI is updated in accordance, every 5 ms
const gameLoop = function () {
    player.updateVelocityAndPosition();
    obstacles.forEach(obstacle => obstacle.move(speed));
    if (score%10 == 0 && score != 0) speed += 0.1
}

pauseBtn.addEventListener('click', pause);
resumeBtn.addEventListener('click', resume);
restartBtn.addEventListener('click', restart);

restart();