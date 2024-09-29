class GameComponent extends HTMLElement {
	connectedCallback(){
		this.innerHTML = `
		<div class="ping-pong">
		<h1>PING PONG</h1>
		<div class="scoreboard">
			<div class="player-profile" id="player1-profile">
				<img src="../svg/miroka.svg" alt="Player 1" class="profile-pic">
				<p class="player-name">miroka</p>
			</div>
			<div class="score-display">
				<span id="score1">0</span> : <span id="score2">0</span>
			</div>
			<div class="player-profile" id="player2-profile">
				<img src="../svg/droke.svg" alt="Player 2" class="profile-pic">
				<p class="player-name">droke</p>
			</div>
		</div>
		<div class="subping">
			<div id="countdown"></div>
			<div id="paddle1" class="paddle"></div>
			<div id="paddle2" class="paddle"></div>
			<div id="ball"></div>
		</div>
		<p style="font-size:30px">Press space to start</p>
		</div>
		`;


		let ball = document.getElementById('ball');
		let paddle1 = document.getElementById('paddle1');
		let paddle2 = document.getElementById('paddle2');


		let ballSpeedX = 8;
		let ballSpeedY = 8;

		let paddle1Y = 50;
		let paddle2Y = 50;

		let keypress = [];

		document.addEventListener('keydown', function(e) {
			keypress[e.key] = true;
		});
		document.addEventListener('keyup', function(e) {
			keypress[e.key] = false;
		});
		let score1 = 0;
		let score2 = 0;
		function updateScore(player) {
			if (player === 1) {
				score1++;
				document.getElementById('score1').textContent = score1;
			} else if (player === 2) {
				score2++;
				document.getElementById('score2').textContent = score2;
			}
			checkwinner();
		}
		function reset(){
			score1 = 0;
			score2 = 0;
			document.getElementById('score1').textContent = score1;
			document.getElementById('score2').textContent = score2;
			ballSpeedX = 8;
			ballSpeedY = 8;
			paddle1Y = 50;
			paddle2Y = 50;
		}

		let vrai = false;

		function  checkwinner() {
			if (score1 === 5 || score2 === 5) {
				const div = document.createElement('div');
				div.className = 'win';
				div.textContent = score1 === 5 ? 'miroka wins' : 'droke wins';
				document.body.appendChild(div);
		
				const button = document.createElement('button');
				button.className = 'retry-btn';
				button.textContent = 'Retry';

				document.body.appendChild(button);
				button.addEventListener('click', function() {
					document.body.removeChild(div);
					document.body.removeChild(button);
					reset();
				});
				vrai = true;
			}
		}

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
			paddle1.style.top = `${paddle1Y}%`;
			paddle2.style.top = `${paddle2Y}%`;
		}
		function startGame() {
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
				ball.style.left = '50%';
				ball.style.top = '50%';
				paddle1.style.top = '50%';
				paddle2.style.top = '50%';
				ballSpeedX = 8;
				ballSpeedY = 8;
			}
			//players score
			if (ballRect.left <= subpingRect.left) {
				updateScore(2);
			}
			if (ballRect.right >= subpingRect.right) {
				updateScore(1);
			}
			ball.style.left = `${ball.offsetLeft + ballSpeedX}px`;
			ball.style.top = `${ball.offsetTop + ballSpeedY}px`;
			movePaddle();
			if (vrai){
				vrai = false;
				return;
			}
			requestAnimationFrame(startGame);
		}


		let value = 3;
		const countdown = document.getElementById('countdown');
		countdown.style.fontSize = '200px'; // Style as needed
		countdown.style.position = 'absolute'; // Position the countdown
		countdown.style.color = 'red'
		countdown.style.top = '0%'; // Center the countdown
		countdown.style.left = '50%'; // Center the countdown
		countdown.style.fontFamily = 'Bungee'
		countdown.style.transform = 'translateX(-43%)'; // Center the countdown

		function startCountdown() {
			const countdownInterval = setInterval(() => {
				countdown.textContent = value;
				if (value <= 0) {
					clearInterval(countdownInterval);
					countdown.style.display = 'none'; // Hide countdown
					startGame(); // Function to start the game
				}
				value--;
			}, 1000);
		}
		let check = false;
		document.addEventListener('keydown', function(e) {
			if (e.key === ' ' && !check) {
				startCountdown();
				check = true;
			}
		});
				
	}
}

customElements.define('game-component', GameComponent);

