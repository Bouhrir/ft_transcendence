class GameComponentOnline extends HTMLElement {
	connectedCallback(){
		this.innerHTML = `
		<canvas id="pongGame" width="800" height="600"></canvas>
        `
        
        // let player_id;
		const canvas = document.getElementById('pongGame');
            const ctx = canvas.getContext('2d');
            let isWebSocketOpen = false;  // Track WebSocket connection state
            
            // Game objects
            const paddleWidth = 10;
            const paddleHeight = 100;
            const ballRadius = 10;
            let playerScore = 0;
            let aiScore = 0;
            let isGameRunning = false;
            let t = 0;
            let player_id
            
            const player = {
                x: 0,
                y: canvas.height / 2 - paddleHeight / 2,
                width: paddleWidth,
                height: paddleHeight,
                color: 'white',
                dy: 0
            };
            
            const ai = {
                x: canvas.width - paddleWidth,
                y: canvas.height / 2 - paddleHeight / 2,
                width: paddleWidth,
                height: paddleHeight,
                color: 'white',
                dy: 0
            };
            
            const ball = {
                x: canvas.width / 2,
                y: canvas.height / 2,
                radius: ballRadius,
                speed: 5,
                dx: 5,
                dy: 4,
                color: 'white'
            };

            // async function user(){
            //     const URL = "http://localhost:81/getuser/";
                

            // }

            const ws = new WebSocket('ws://localhost:81/ws/pong/');
            ws.onopen = function() {
                console.log("WebSocket is open now.");
                isWebSocketOpen = true;
            };

            // Handle WebSocket errors
            ws.onerror = function(error) {
                console.error("WebSocket error:", error);
            };

            // Handle WebSocket close
            ws.onclose = function() {
                isWebSocketOpen = false;
            };
            
            ws.onmessage = function(event) {
                const data = JSON.parse(event.data);
                
                if (data.action == "new_connection") {
                    console.log("new connection")
                    // console.log(player_id)
                    
                }
                else if (data.action == "game_state") {
                    ball.x = data.game_state.ball.x
                    ball.y = data.game_state.ball.y
                    if (data.game_state.players.player1.id == player_id) {
                        player.y = data.game_state.players.player1.player_y
                        ai.y = data.game_state.players.player1.ai_y
                    } else {
                        player.y = data.game_state.players.player2.player_y
                        ai.y = data.game_state.players.player2.ai_y
                    }
                }

                // console.log(data.game_state)
            }
            // this is not exactly right because they don't start with the same thing i guess

            function getAccessTokenFromCookies() {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.startsWith('access=')) {
                        return cookie.substring('access='.length);
                    }
                }
                return null;
            }
            const access = getAccessTokenFromCookies();
            async function getId(){
                const response = await fetch('http://localhost:81/auth/me/', {
                    method : 'GET',
                    headers:{
                        'Authorization': `Bearer ${access}`, // Authorization header with JWT
                        'Content-Type': 'application/json',
                    }
                });
    
                if (response.ok){
                    const data = await response.json();
                    console.log('id ====> ' + data.id);
                    console.log('username ====> ' + data.username);
                    player_id = data.id
                    await sendPlayerIdWhenReady();
                }
                else
                    console.error('error:', response.statusText);
            }
            
            async function sendPlayerIdWhenReady() {
                while (!isWebSocketOpen || player_id === null) {
                    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms before checking again
                }
            
                // At this point, both conditions are met
                const data_to_send = {
                    type: 'user_id',
                    id: player_id
                };
                ws.send(JSON.stringify(data_to_send));
            }
            getId();
            // Draw functions
            function drawPaddle(x, y, width, height, color) {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, width, height);
            }

            function drawBall(x, y, radius, color) {
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.closePath();
            }

            function drawScore() {
                ctx.font = '32px Arial';
                ctx.fillStyle = 'white';
                ctx.fillText(playerScore, canvas.width / 4, 50);
                ctx.fillText(aiScore, (3 * canvas.width) / 4, 50);
            }    

            // Render game objects
            function render() {
                // Clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw paddles, ball, and scores
                drawPaddle(player.x, player.y, player.width, player.height, player.color);
                drawPaddle(ai.x, ai.y, ai.width, ai.height, ai.color);
                drawBall(ball.x, ball.y, ball.radius, ball.color);
                drawScore();
            }
            // Game loop
            function gameLoop() {
                render();
                requestAnimationFrame(gameLoop);
            }

            // Keyboard events for player control
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowUp') {
                    // player.dy = -5;
                    if (isWebSocketOpen) {
                        const data = {
                            type: 'paddle_movement',
                            paddle_dy: -5,
                            player_id: player_id
                        };
                        ws.send(JSON.stringify(data));
                    }
                } else if (e.key === 'ArrowDown') {
                    // player.dy = 5;
                    if (isWebSocketOpen) {
                        const data = {
                            type: 'paddle_movement',
                            paddle_dy: 5,
                            player_id: player_id
                        };
                        ws.send(JSON.stringify(data));
                    }
                }
            });

            document.addEventListener('keyup', (e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    if (isWebSocketOpen) {
                        const data = {
                            type: 'paddle_movement',
                            paddle_dy: 0,
                            player_id: player_id
                        };
                        ws.send(JSON.stringify(data));
                    }
                    // player.dy = 0;
                }
            });
            gameLoop();
            // Start the game loop
	}
}

customElements.define('game-component-online', GameComponentOnline);

