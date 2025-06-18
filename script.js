'use strict';

let background = document.querySelector('.background'), playerElem = document.querySelector('.player');
let groundThickness = 10;

const player = {
    
    vel: 0, // vertical velocity
    yInitial: background.style.height - playerElem.style.height - groundThickness, // vertical position (inital value as per the posiion of the ground in the DOM)
    y: yInitial,
    g: 150, // gravitational acceleration
    count: 0, // number of spacebar clicks
    freeFall: false, // when the player is mid-air and it's velocity can no longer be increased
    
    // updates the player's velocity and position
    updateVelocityAndPosition() {
        this.vel = this.vel + this.g*0.01; // updates the velocity using gravity
        this.y += this.vel*0.1; // updates position using velocity

        // resets at ground level
        if (this.y > this.yInitial) {
            this.y = this.yInitial;
            this.vel = 0;
            this.count = 0;
            this.freeFall = false; // this enables the player to jump again
        } 
    }
}

// player jumps when spacebar is pressed
window.addEventListener('keydown', function (e) {

    // the velocity is only increased if it's been increased less than two times since the player got off the ground, and the user hasn't let go of the spacebar
    if (e.key == " " && player.count < 2 && !player.freeFall) {  
        player.count++;
        player.vel -= 30;        
    }
});

// ensures once the spacebar is released, the player can no longer jump until it lands on the ground
window.addEventListener('keyup', function (e) {
    if (e.key == " ") {  
        player.freeFall = true;
    }
});

// the velocity and postion, and the UI is updated in accordance, every 10 ms
window.setInterval(function () {
    player.updateVelocityAndPosition();
    playerElem.style.top = `${player.y}px`; 
}, 10)
    