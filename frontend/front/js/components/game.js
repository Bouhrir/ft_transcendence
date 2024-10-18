import { getAccessTokenFromCookies } from "./help.js";
let PlayerUser = '';

class GameComponent extends HTMLElement {
	async connectedCallback(){
		this.innerHTML = `
		<div class="ping-pong">
			<h1>PING PONG</h1>
			<div class="scoreboard">
				<div class="player-profile" id="player1-profile">
					<img src="#" alt="Player 1" class="profile-pic" id="playerImg" width=100px height=100px>
					<p class="player-name" id="playerName"></p>
				</div>
				<div class="score-display">
					<span id="score1">0</span> : <span id="score2">0</span>
				</div>
				<div class="player-profile" id="player2-profile">
					<img src="../../svg/ai.webp" alt="Player 2" class="profile-pic" width=100px height=100px>
					<p class="ai" >الذكاء الاصطناعي</p>
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

		this.fetchUserData();
		
		let ball = document.getElementById('ball');
		let paddle1 = document.getElementById('paddle1');
		let paddle2 = document.getElementById('paddle2');

		let ballSpeedX = 8;
		let ballSpeedY = 8;

		let paddle1Y = 50;
		let paddle2Y = 50;

		let keypress = [];
		let aiSpeed = 2; // Speed at which the AI paddle moves

		document.addEventListener('keydown', function (e) {
			keypress[e.key] = true;
		});
		document.addEventListener('keyup', function (e) {
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
			checkwinner(score1 , score2);
		}

		function reset() {
			location.reload();
		}

		let vrai = false;

		function checkwinner(score1 , score2) {
			if (score1 === 5 || score2 === 5) {
				const score = document.createElement('p');
				score.style.fontFamily = 'Baloo_bhai_2'
				score.className = 'score';
				score.innerHTML = `${score1} - ${score2}`;
				document.body.appendChild(score);


				const div = document.createElement('div');
				div.className = 'win-message';
				div.textContent = score1 === 5 ? `${PlayerUser} wins` : 'AI wins';
				document.body.appendChild(div);


				const button = document.createElement('button');
				button.className = 'retry-btn';
				button.textContent = 'Retry';
				document.body.appendChild(button);

				button.addEventListener('click', function () {
					reset();
					pingpong();
				});
				vrai = true;
			}
		}

		// Move paddle 1 manually with keys
		function movePaddle() {
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
			paddle1.style.top = `${paddle1Y}%`;


			if (keypress['up']) {
				if (paddle2Y - 9 >= 0) {
					paddle2Y -= SPEED;
				}
			}
			if (keypress['down']) {
				if (paddle2Y + 9 <= 100) {
					paddle2Y += SPEED;
				}
			}
			paddle1.style.top = `${paddle1Y}%`;
			paddle2.style.top = `${paddle2Y}%`;
			moveAIPaddle();
		}

		// AI logic to move the second paddle
		function moveAIPaddle() {
			let ballRect = ball.getBoundingClientRect();
			let paddle2Rect = paddle2.getBoundingClientRect();
			let subpingRect = document.querySelector('.subping').getBoundingClientRect();

			let ballYCenter = ballRect.top + (ballRect.height / 2);
			let paddle2YCenter = paddle2Rect.top + (paddle2Rect.height / 2);

			// Move paddle 2 up or down based on ball position, limit AI speed
			if (ballYCenter < paddle2YCenter && paddle2Rect.top > subpingRect.top) {
				paddle2Y -= aiSpeed;
			} else if (ballYCenter > paddle2YCenter && paddle2Rect.bottom < subpingRect.bottom) {
				paddle2Y += aiSpeed;
			}

			paddle2.style.top = `${paddle2Y}%`;
		}

		function startGame() {
			let ballRect = ball.getBoundingClientRect();
			let paddle1Rect = paddle1.getBoundingClientRect();
			let paddle2Rect = paddle2.getBoundingClientRect();
			let subpingRect = document.querySelector('.subping').getBoundingClientRect();

			// Ball collision with paddles
			if (ballRect.left <= paddle1Rect.right && ballRect.right >= paddle1Rect.left &&
				ballRect.top <= paddle1Rect.bottom && ballRect.bottom >= paddle1Rect.top && ballSpeedX < 0) {
				ballSpeedX *= -1;
			}
			if (ballRect.left <= paddle2Rect.right && ballRect.right >= paddle2Rect.left &&
				ballRect.top <= paddle2Rect.bottom && ballRect.bottom >= paddle2Rect.top && ballSpeedX > 0) {
				ballSpeedX *= -1;
			}

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

			if (ballRect.left <= subpingRect.left) {
				updateScore(2);
			}
			if (ballRect.right >= subpingRect.right) {
				updateScore(1);
			}

			// Move ball
			ball.style.left = `${ball.offsetLeft + ballSpeedX}px`;
			ball.style.top = `${ball.offsetTop + ballSpeedY}px`;

			movePaddle();

			if (vrai) {
				vrai = false;
				return;
			}

			console.log(aiSpeed)
			requestAnimationFrame(startGame);
		}

		const countdown = document.getElementById('countdown');
		let value = 3;
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

		// Slowing down the paddle after 10 seconds
		function slowDownPaddles() {
			let slowdownInterval = setInterval(() => {
				if (paddleSpeed1X > 0.5) {
					paddleSpeed -= 0.1; // Reduce player paddle speed
				}
				if (aiSpeed > 0.5) {
					aiSpeed -= 0.1; // Reduce AI paddle speed
				}
			}, 1000); // Reduce speed every second
		}

		function pingpong() {
			let check = false;
			document.addEventListener('keydown', function (e) {
				if (e.key === ' ' && !check) {
					startCountdown();
					check = true;
				}
			});
		}

		pingpong();
				
	}
	async fetchUserData(){
		const access = getAccessTokenFromCookies('access');
        const player = document.getElementById('playerName');
        const imgProfile = document.getElementById('playerImg');
		const response = await fetch('http://localhost:81/auth/me/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
            }
        });
		if (response.ok){
			const data = await response.json();
			player.textContent = data.username;
			PlayerUser = data.username;
			imgProfile.src = data.image;
		}
		else
			console.log('error : fetch User data');
	}

}

customElements.define('game-component', GameComponent);

