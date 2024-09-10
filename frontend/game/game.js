let ball = document.getElementById('ball');
let paddle1 = document.getElementById('paddle1');
let paddle2 = document.getElementById('paddle2');


let ballSpeedX = 4;
let ballSpeedY = 4;

let paddle1Y = 50;
let paddle2Y = 50;

let keypress = [];

document.addEventListener('keydown', function(e) {
    keypress[e.key] = true;
});
document.addEventListener('keyup', function(e) {
    keypress[e.key] = false;
});


function movePaddle(e) {
    let SPEED = 2;
    if (keypress['w']) {
        if (paddle1Y - 9 >= 0) {
            paddle1Y -= SPEED;
        }
    }
    if (keypress['s']) {
        if (paddle1Y + 9 <= 100) {
            paddle1Y += SPEED;
        }
    }
    if (keypress['ArrowUp']) {
        if (paddle2Y - 9 >= 0) {
            paddle2Y -= SPEED;
        }
    }
    if (keypress['ArrowDown']) {
        if (paddle2Y + 9 <= 100) {
            paddle2Y += SPEED;
        }
    }
    // switch(e.key) {
    //     case 'w':
    //         if(paddle1Y - 9 >= 0){
    //             paddle1Y -= SPEED;
    //         }
    //         break;
    //     case 's':
    //         if(paddle1Y + 9 <= 100){
    //             paddle1Y += SPEED;
    //         }   
    //         break;
    //     case 'ArrowUp':
    //         if(paddle2Y - 9 >= 0){
    //             paddle2Y -= SPEED;
    //         }
    //         break;
    //     case 'ArrowDown':
    //         if(paddle2Y + 9 <= 100){
    //             paddle2Y += SPEED;
    //         }
    //         break;
    // }
    paddle1.style.top = `${paddle1Y}%`;
    paddle2.style.top = `${paddle2Y}%`;
}
function moveBall() {
    let ballRect = ball.getBoundingClientRect();
    let paddle1Rect = paddle1.getBoundingClientRect();
    let paddle2Rect = paddle2.getBoundingClientRect();
    let subpingRect = document.querySelector('.subping').getBoundingClientRect();

    if (ballRect.left <= paddle1Rect.right && ballRect.right >= paddle1Rect.left &&
        ballRect.top <= paddle1Rect.bottom && ballRect.bottom >= paddle1Rect.top && ballSpeedX < 0) {
        ballSpeedX *= -1;
    }
    if (ballRect.left <= paddle2Rect.right && ballRect.right >= paddle2Rect.left &&
        ballRect.top <= paddle2Rect.bottom && ballRect.bottom >= paddle2Rect.top && ballSpeedX > 0) {
        ballSpeedX *= -1;
    }

    // Check if the ball is about to move outside the subping div
    if (ballRect.top <= subpingRect.top || ballRect.bottom >= subpingRect.bottom) {
        ballSpeedY *= -1;
    }
    if (ballRect.left <= subpingRect.left || ballRect.right >= subpingRect.right) {
        ballSpeedX *= -1;
        ball.style.left = '50%';
        ball.style.top = '50%';
        paddle1.style.top = '50%';
        paddle2.style.top = '50%';
        ballSpeedX = 2;
        ballSpeedY = 2;
    }

    ball.style.left = `${ball.offsetLeft + ballSpeedX}px`;
    ball.style.top = `${ball.offsetTop + ballSpeedY}px`;
    movePaddle();
    requestAnimationFrame(moveBall);
}
// document.addEventListener('keydown', movePaddle);
moveBall();
// setInterval(moveBall, 10);


