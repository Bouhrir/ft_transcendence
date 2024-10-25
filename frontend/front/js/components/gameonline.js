import { getAccessTokenFromCookies } from "./help.js";
class GameComponentOnline extends HTMLElement {
	async connectedCallback(){
		this.innerHTML =`
      
            <div class="ping-pong">
            <h1>PING PONG</h1>
            <div class="scoreboard">
                <div class="player-profile" id="player1-profile">
                    <img src="#" alt="Player 1" class="profile-pic" id="player-img" width=100px height=100px>
                    <p class="player-name" id="player-name"></p>
                </div>
                <div class="score-display">
                    <span id="score1">0</span> : <span id="score2">0</span>
                </div>
                <div class="player-profile" id="player2-profile">
                    <img id="ai-img" src="" alt="Player 2" class="profile-pic" width=100px height=100px>
                    <p class="player-name" id="ai-name" ></p>
                </div>
            </div>
            <canvas id="pongGame" width=1525 height=640></canvas>
            <div id="TableCustom">
                <h1>tables</h1>
                <div class="array">
                <label for="ballColor">Ball Color:</label>
                <input type="color" id="ballColor" name="ballColor" value="#c68fe6">
                
                <label for="paddleColor">Paddle Color:</label>
                <input type="color" id="paddleColor" name="paddleColor" value="#1230ae">
                
                <label for="tableColor">Table Color:</label>
                <input type="color" id="tableColor" name="tableColor" value="#6c48c5">
                </div>
                <div id="gameCostum"><p> ↑ up </p><p> ↓ down</p></div>
            </div>
            <p style="font-size:30px">Press space to start</p>
        </div>
        <div class="waiting">
            <div class="waiting-message">waiting for opponent...</div>
            <button id="leave-button">cancel</button>
        </div>
            `;

        if (!window.gameRoom) {
            // Redirect to another page if room_name is missing
            window.location.href = '#dashboard';
            return
        }
        const firstScore = document.getElementById('score1')
        const secondScore = document.getElementById('score2')
        const canvas = document.getElementById('pongGame');
        const ctx = canvas.getContext('2d');
        let isWebSocketOpen = false;  // Track WebSocket connection state
        // Game objects
        const leaveButton = document.getElementById('leave-button')
        const paddleWidth = 14;
        const paddleHeight = 120;
        const ballRadius = 10;
        let playerScore = 0;
        let aiScore = 0;
        let isGameRunning = false;
        let t = 0;
        let player_id
        
        fetchUserData();

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
        window.ws = new WebSocket(`wss://localhost:81/ws/pong/${window.gameRoom}/`);
        // window.ws = ws
        window.ws.onopen = function () {
            console.log("remote WebSocket is open now.");
            isWebSocketOpen = true;
        };

        // Handle WebSocket errors
        window.ws.onerror = function (error) {
            console.error("WebSocket error:", error);
        };

        // Handle WebSocket close
        window.ws.onclose = function () {
            isWebSocketOpen = false;
        };

        window.ws.onmessage = function (event) {
            const data = JSON.parse(event.data);

            if (data.action == "new_connection") {
                player_id = data.player_id
                console.log("new connection to remote game: ", player_id)
            }
            else if (data.action == "game_state") {
                ball.x = data.game_state.ball.x
                ball.y = data.game_state.ball.y
                if (data.game_state.players.player1.id == player_id) {
                    player.y = data.game_state.players.player1.player_y
                    ai.y = data.game_state.players.player1.ai_y
                    playerScore = data.game_state.players.player1.player_score
                    aiScore = data.game_state.players.player1.ai_score
                } else {
                    player.y = data.game_state.players.player2.player_y
                    ai.y = data.game_state.players.player2.ai_y
                    aiScore = data.game_state.players.player1.player_score
                    playerScore = data.game_state.players.player1.ai_score
                }
            }
            else if (data.action == "no_room") {
                const view = document.querySelector(".waiting")
                view.style.display = "flex"
                const message = document.querySelector(".waiting-message")
                message.innerText = "game room doesn't exist"
            }
            else if (data.action == "start") {
                console.log("game starting")
                const view = document.querySelector(".waiting")
                view.style.display = "none"
                if (player_id != data.player1_id) {
                    fetchAiData(data.player1_id)
                } else {
                    fetchAiData(data.player2_id)
                }
            }
            else if (data.action == "end") {
                const view = document.querySelector(".waiting")
                view.style.display = "flex"
                const message = document.querySelector(".waiting-message")
                message.innerText = "game finished"
            }
        }

        function drawScore() {
            ctx.font = '32px Arial';
            ctx.fillStyle = 'white';
            firstScore.textContent = playerScore;
            secondScore.textContent = aiScore;
        }

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
        
        function render() {
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawPaddle(player.x + 4, player.y, player.width, player.height, player.color);
            drawPaddle(ai.x - 4, ai.y, ai.width, ai.height, ai.color);
            drawBall(ball.x, ball.y, ball.radius, ball.color);
            drawScore();
        }

        // Keyboard events for player control
        document.addEventListener('keydown', (e) => {
            console.log("sending data: ", isWebSocketOpen);
            if (e.key === 'ArrowUp' && !isUpPressed) {
                isUpPressed = true;
                if (isWebSocketOpen) {
                    const data = {
                        type: 'paddle_movement',
                        room_name: window.gameRoom,
                        paddle_dy: -5,
                        player_id: player_id
                    };
                    window.ws.send(JSON.stringify(data));
                }
            } else if (e.key === 'ArrowDown' && !isDownPressed) {
                isDownPressed = true;
                if (isWebSocketOpen) {
                    const data = {
                        type: 'paddle_movement',
                        room_name: window.gameRoom,
                        paddle_dy: 5,
                        player_id: player_id
                    };
                    window.ws.send(JSON.stringify(data));

                }
            }
        });
        let isUpPressed = false;
        let isDownPressed = false;
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowUp' && isUpPressed) {
                isUpPressed = false;
                if (isWebSocketOpen) {
                    const data = {
                        type: 'paddle_movement',
                        room_name: window.gameRoom,
                        paddle_dy: 0,
                        player_id: player_id
                    };
                    window.ws.send(JSON.stringify(data));
                }
            } else if (e.key === 'ArrowDown' && isDownPressed) {
                isDownPressed = false;
                if (isWebSocketOpen) {
                    const data = {
                        type: 'paddle_movement',
                        room_name: window.gameRoom,
                        paddle_dy: 0,
                        player_id: player_id
                    };
                    window.ws.send(JSON.stringify(data));
                }
            }
        });
        leaveButton.addEventListener('click', (e) => {
            if (leaveButton.innerText == "cancel") {
                if (isWebSocketOpen) {
                    const data = {
                        type: 'leave',
                        room_name: window.gameRoom,
                        player_id: player_id
                    };
                    window.ws.send(JSON.stringify(data));
                }
            }
            // you could get the type if it's game or tournament so you can go back to the right page instead of going back to tournament
            window.location.href = "#tournament"
        })
        function gameLoop() {
            render()
            requestAnimationFrame(gameLoop)
        }
        gameLoop();
        checkTable();

        async function fetchUserData(){
	    	const access = getAccessTokenFromCookies('access');
            const playerName = document.getElementById('player-name');
            const playerImg = document.getElementById('player-img');
	    	const response = await fetch('https://localhost:81/auth/me/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access}`,
                    'Content-Type': 'application/json',
                }
            });
	    	if (response.ok){
	    		const data = await response.json();
                if (window.playerAlias) {
                    playerName.textContent = window.playerAlias
                } else {
                    playerName.textContent = data.username;
                }
	    		playerImg.src = data.image;
	    	}
	    	else
	    		console.log('error : fetch User data');
        }

        async function fetchAiData(id){
            const aiName = document.getElementById('ai-name');
            const aiImg = document.getElementById('ai-img');
            const access = getAccessTokenFromCookies('access');
            const response = await fetch('https://localhost:81/auth/getuser/', {
                method: 'POST',
                headers:{
                    'Authorization': `Bearer ${access}`,
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({
                   'id':id
                })
            });
            if (response.ok){
                const data = await response.json();
                if (window.aiAlias) {
                    aiName.textContent = window.aiAlias
                } else {
                    aiName.textContent = data.username;

                }
	    		aiImg.src = data.image;
            }
        }
        function checkTable(){ 
            const ballColorInput = document.getElementById('ballColor');
            const paddleColorInput = document.getElementById('paddleColor');
            const tableColorInput = document.getElementById('tableColor');
            const table = document.getElementById('pongGame');
            
            ballColorInput.addEventListener('input', () => {
                ball.color = ballColorInput.value;
                table.style.border = `5px solid ${ballColorInput.value}`;
    
            });
        
            paddleColorInput.addEventListener('input', () => {
                player.color = paddleColorInput.value;
                ai.color = paddleColorInput.value;
            });
        
            tableColorInput.addEventListener('input', () => {
                canvas.style.background = tableColorInput.value;
            });
        }

    
    }
    disconnectedCallback() {
        // Assume you have an existing WebSocket connection stored in `window.ws`
        if (window.ws) {
            // Check if the WebSocket is open or connecting before trying to close it
            if (window.ws.readyState === WebSocket.OPEN || window.ws.readyState === WebSocket.CONNECTING) {
                // Close the WebSocket with a status code and an optional reason
                window.ws.close(1000);

                // Optionally, set the WebSocket to null to ensure it can be reconnected later
                window.ws = null;
                console.log("WebSocket closed from the front end.");
            }
        }
        window.playerAlias = null
        window.aiAlias = null
    }
}

customElements.define('game-component-online', GameComponentOnline);