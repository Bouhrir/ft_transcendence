let ball = document.getElementById('ball');
let paddle1 = document.getElementById('paddle1');
let paddle2 = document.getElementById('paddle2');


let ballSpeedX = 2;
let ballSpeedY = 2;

let paddle1Y = 50;
let paddle2Y = 50;

function movePaddle(e) {
    let speed = 6;
    switch(e.key) {
        case 'w':
            if(paddle1Y - 9 >= 0){
                paddle1Y -= speed;
            }
            break;
        case 's':
            if(paddle1Y + 9 <= 100){
                paddle1Y += speed;
            }
            break;
        case 'ArrowUp':
            if(paddle2Y - 9 >= 0){
                paddle2Y -= speed;
            }
            break;
        case 'ArrowDown':
            if(paddle2Y + 9 <= 100){
                paddle2Y += speed;
            }
            break;
    }
    paddle1.style.top = `${paddle1Y}%`;
    paddle2.style.top = `${paddle2Y}%`;
}
function moveBall() {
    let ballRect = ball.getBoundingClientRect();
    let paddle1Rect = paddle1.getBoundingClientRect();
    let paddle2Rect = paddle2.getBoundingClientRect();
    let subpingRect = document.querySelector('.subping').getBoundingClientRect();

    if (ballRect.left <= paddle1Rect.right && ballRect.right >= paddle1Rect.left &&
        ballRect.top <= paddle1Rect.bottom && ballRect.bottom >= paddle1Rect.top) {
        ballSpeedX *= -1;
    }
    if (ballRect.left <= paddle2Rect.right && ballRect.right >= paddle2Rect.left &&
        ballRect.top <= paddle2Rect.bottom && ballRect.bottom >= paddle2Rect.top) {
        ballSpeedX *= -1;
    }

    // Check if the ball is about to move outside the subping div
    if (ballRect.top <= subpingRect.top || ballRect.bottom >= subpingRect.bottom) {
        ballSpeedY *= -1;
    }
    if (ballRect.left <= subpingRect.left || ballRect.right >= subpingRect.right) {
        ballSpeedX *= -1;
    }

    ball.style.left = `${ball.offsetLeft + ballSpeedX}px`;
    ball.style.top = `${ball.offsetTop + ballSpeedY}px`;
}
document.addEventListener('keydown', movePaddle);
setInterval(moveBall, 10);