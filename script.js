'use strict';

const player = {
    playerElem: document.querySelector('.player'),
    velocity: 0,
    y: 190,
    g: 150,
    count: 0,
    offGround: false,
    updateVelocityAndPosition() {
        this.velocity = this.velocity + this.g*0.01;
        this.y += this.velocity*0.1;

        if (this.y > 190) {
            this.y = 190;
            this.velocity = 0;
            this.count = 0;
            this.offGround = false;
        } 
    }
}

window.addEventListener('keydown', function (e) {
    if (e.key == " " && playerProps.count < 2 && !playerProps.offGround) {  
        playerProps.count++;
        playerProps.velocity -= 30;        
    }
});

window.addEventListener('keyup', function (e) {
    if (e.key == " ") {  
        playerProps.offGround = true;
    }
});

window.setInterval(function () {
    playerProps.updateVelocityAndPosition();
    player.style.top = `${playerProps.y}px`; 
    
    
}, 10)
    