import { getAccessTokenFromCookies } from "./help.js";
class GameComponentOnline extends HTMLElement {
	async connectedCallback(){
		this.innerHTML =`
      
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
                    <img id="ai" src="" alt="Player 2" class="profile-pic" width=100px height=100px>
                    <p class="ai" id="playerName1" ></p>
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
                <div id="gameCostum"><p> + ai </p><p> - !ai </p><p> * x2 </p><p> / x0.5</p></div>
            </div>
            <p style="font-size:30px">Press space to start</p>
        </div>
        <div class="waiting">
            <div class="waiting-message">waiting for opponent...</div>
            <button id="leave-button">leave</button>
        </div>
            `;
        // <a href="#signin">click</a>
        // document.addEventListener('keyup', (e) => {

        // });
        // window.location.href = '#signin';
        // function getQueryParams() {
        //     const params = {};
        //     window.location.search.substring(1).split("&").forEach(function(part) {
        //         const [key, value] = part.split("=");
        //         params[decodeURIComponent(key)] = decodeURIComponent(value);
        //     });
        //     return params;
        // }
        // const queryParams = getQueryParams();
        // const roomName = queryParams.room_name;

        // if (roomName) {
        // }
        // console.log('Joining room:', window.gameRoom);
        // console.log('Joining room:', window.gameRoom);
        // const ws = new WebSocket(`ws://localhost:81/ws/pong/${window.gameRoom}/`);
        // ws.onopen = function() {
        //     console.log("remote WebSocket is open now.");
        //     // isWebSocketOpen = true;
        // };

        // // Handle WebSocket errors
        // ws.onerror = function(error) {
        //     console.error("WebSocket error:", error);
        // };

        // // Handle WebSocket close
        // ws.onclose = function() {
        //     // isWebSocketOpen = false;
        // };
        // function getAccessTokenFromCookies() {
        //     const cookies = document.cookie.split(';');
        //     for (let i = 0; i < cookies.length; i++) {
        //         const cookie = cookies[i].trim();
        //         if (cookie.startsWith('access=')) {
        //             return cookie.substring('access='.length);
        //         }
        //     }
        //     return null;
        // }
        // const access = getAccessTokenFromCookies();

        // function sendInvitation(inviterId, inviteeId) {
        //     fetch('/remote/send-invitation/', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/x-www-form-urlencoded',
        //             'Authorization': `Bearer ${access}`

        //         },
        //         body: `inviter_id=${inviterId}&invitee_id=${inviteeId}`
        //     })
        //     .then(response => response.json())
        //     .then(data => console.log(data))
        //     .catch(error => console.error('Error:', error));
        // }

        // // sendInvitation(18, 25)

        // function acceptInvitation(username) {
        //     fetch('/remote/accept-invitation/', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Authorization': `Bearer ${access}`
        //         },
        //         body: JSON.stringify({ inviter_username: username })
        //     })
        //     .then(response => {
        //         if (!response.ok) {
        //             throw new Error('Network response was not ok: ' + response.statusText);
        //         }
        //         return response.json();
        //     })
        //     .then(data => {
        //         console.log('Invitation accepted. Room Name:', data.room_name);
        //         // Redirect or join the room using the room_name
        //         // window.location.href = `/game?room_name=${data.room_name}`; // Navigate to the game page
        //     })
        //     .catch(error => {
        //         console.error('Error:', error);
        //     });
        // }
        // // acceptInvitation("amdouyah")

        // function deleteInvitation(username) {
        //     fetch('/remote/delete-invitations/', {
        //         method: 'DELETE',
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Authorization': `Bearer ${access}`
        //         },
        //         body: JSON.stringify({ inviter_username: username })
        //     })
        //     .then(response => {
        //         if (!response.ok) {
        //             throw new Error('Network response was not ok: ' + response.statusText);
        //         }
        //         return response.json();
        //     })
        //     .then(data => {
        //         console.log('invitation have been deleted successfuly');
        //         // Redirect or join the room using the room_name
        //         // window.location.href = `/game?room_name=${data.room_name}`; // Navigate to the game page
        //     })
        //     .catch(error => {
        //         console.error('Error:', error);
        //     });
        // }
        // deleteInvitation("amdouyah")

        // let player_id;

        // const roomName = window.localStorage.getItem('roomName');
        // console.log("game_room_in_game: ", roomName)
        if (!window.gameRoom) {
            // Redirect to another page if room_name is missing
            window.location.href = '#dashboard';
            return
        }
        // else {
        const canvas = document.getElementById('pongGame');
        const ctx = canvas.getContext('2d');
        let isWebSocketOpen = false;  // Track WebSocket connection state
        this.fetchUserData();
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
        const ws = new WebSocket(`ws://localhost:81/ws/pong/${window.gameRoom}/`);
        // const ws = new WebSocket(`ws://localhost:81/ws/pong/123/`);
        ws.onopen = function () {
            console.log("remote WebSocket is open now.");
            isWebSocketOpen = true;
        };

        // Handle WebSocket errors
        ws.onerror = function (error) {
            console.error("WebSocket error:", error);
        };

        // Handle WebSocket close
        ws.onclose = function () {
            isWebSocketOpen = false;
        };

        ws.onmessage = function (event) {
            const data = JSON.parse(event.data);

            if (data.action == "new_connection") {
                console.log("new connection")
                player_id = data.player_id
                console.log(player_id)
            }
            else if (data.action == "game_state") {
                console.log("receiving data from back")
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
            document.getElementById('score1').textContent = playerScore;
            document.getElementById('score2').textContent = aiScore;
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
            // Draw paddles, ball, and scores
            drawPaddle(player.x + 4, player.y, player.width, player.height, player.color);
            drawPaddle(ai.x - 4, ai.y, ai.width, ai.height, ai.color);
            drawBall(ball.x, ball.y, ball.radius, ball.color);
            drawScore();
        }

        // Render game objects

        // Keyboard events for player control
        document.addEventListener('keydown', (e) => {
            console.log("sending data: ", isWebSocketOpen);
            if (e.key === 'ArrowUp') {
                // player.dy = -5;
                if (isWebSocketOpen) {
                    const data = {
                        type: 'paddle_movement',
                        room_name: window.gameRoom,
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
                        room_name: window.gameRoom,
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
                        room_name: window.gameRoom,
                        paddle_dy: 0,
                        player_id: player_id
                    };
                    ws.send(JSON.stringify(data));
                }
                // player.dy = 0;
            }
        });
        leaveButton.addEventListener('click', (e) => {
            window.location.href = "#tournament"
        })
        function gameLoop() {
            render()
            requestAnimationFrame(gameLoop)
        }
        gameLoop();
            // Start the game loop
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
			imgProfile.src = data.image;
		}
		else
			console.log('error : fetch User data');
	}
}
// }

customElements.define('game-component-online', GameComponentOnline);

