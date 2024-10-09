class GameComponentOnline extends HTMLElement {
	connectedCallback(){
		this.innerHTML =`
		<canvas id="pongGame" width="800" height="600"></canvas>
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
            const ws = new WebSocket(`ws://localhost:81/ws/pong/${window.gameRoom}/`);
            ws.onopen = function() {
                console.log("remote WebSocket is open now.");
                // const data = {
                //     type: 'new_connection',
                // };
                // ws.send(JSON.stringify(data));
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
                    player_id = data.player_id
                    console.log(player_id)               
                }
                else if (data.action == "game_state") {
                    ball.x = data.game_state.ball.x
                    ball.y = data.game_state.ball.y
                    if (data.game_state.players.player1.id == player_id) {
                        player.y = data.game_state.players.player1.player_y
                        ai.y = data.game_state.players.player1.ai_y
                        playerScore = data.game_state.players.player1.player_score
                        aiScore = data.game_state.players.player1.ai_score
                        console.log(playerScore)
                        console.log(aiScore)
                    } else {
                        player.y = data.game_state.players.player2.player_y
                        ai.y = data.game_state.players.player2.ai_y
                        aiScore = data.game_state.players.player1.player_score
                        playerScore = data.game_state.players.player1.ai_score
                    }
                    
                }
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
            gameLoop();
            // Start the game loop
	}
}

customElements.define('game-component-online', GameComponentOnline);

