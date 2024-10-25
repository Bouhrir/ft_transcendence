class TournamentComponent extends HTMLElement {
    // constructor() {
    //     super();
    //     this.players = [];
    //     this.maxPlayers = 4;
    // }

    async connectedCallback() {

        this.innerHTML = `
            <div class="avatar-winner">
                <p id="winning-msg">W I N N ER</p>
                <img class="av-win" id="winner-player"></img>
            </div>
            <div class="tournament">
                <div class="lines">
                    <div class="avatar-player">
                    <!-- here -->
                        <img class="av-img" id="semis-first-player"></img>
                        <span class="tourn-score" id="semis-first-player-score">0</span>
                            <svg width="2" height="58" viewBox="0 0 2 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.01739 -0.000154686L2 113" stroke="white" stroke-width="2"/>
                            </svg>
                        <span class="tourn-score" id="semis-second-player-score">0</span>
                        <img class="av-img" id="semis-second-player"></img>
                    </div>
                    <div>
                        <svg width="114" height="468" viewBox="0 0 114 468" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M56.0002 234H113.628" stroke="white" stroke-width="2"/>
                            <path d="M0.000225067 1H57.6279" stroke="white" stroke-width="2"/>
                            <path d="M0.000225067 467H57.6279" stroke="white" stroke-width="2"/>
                            <line x1="57" y1="1" x2="57" y2="467" stroke="white" stroke-width="2"/>
                        </svg>
                    </div>

                    <div class="avatar-player">
                        <img class="av-img" id="final-first-player"></img>
                    </div>
                    <p class="tourn-score-final" id="final-first-player-score">0</p>
                </div>
                <div id="lineMiddle">
                    <div>
                        <svg width="58" height="2" viewBox="0 0 58 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M57.6277 1H0" stroke="white" stroke-width="2"/>
                        </svg>
                    </div>
                </div>
                <div class="lines">
                    <p class="tourn-score-final" id="final-second-player-score">0</p>
                    <div class="avatar-player">
                        <img class="av-img" id="final-second-player"></img>
                    </div>
                    <div>
                        <svg width="114" height="468" viewBox="0 0 114 468" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M57.6277 234H0" stroke="white" stroke-width="2"/>
                            <path d="M113.628 1H56" stroke="white" stroke-width="2"/>
                            <path d="M113.628 467H56" stroke="white" stroke-width="2"/>
                            <line y1="-1" x2="466" y2="-1" transform="matrix(4.37115e-08 1 1 -4.37115e-08 57.6279 1)" stroke="white" stroke-width="2"/>
                        </svg>
                    </div>
                    <div class="avatar-player" >
                        <img class="av-img" id="semis-third-player"></img>
                        <span class="tourn-score" id="semis-third-player-score">0</span>
                        <svg width="2" height="58" viewBox="0 0 2 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.01739 -0.000154686L2 113" stroke="white" stroke-width="2"/>
                        </svg>
                        <span class="tourn-score" id="semis-fourth-player-score">0</span>
                        <img class="av-img" id="semis-fourth-player"></img>
                    </div>
                </div>
            </div>
            <div class="controls">
                <input type="text" id="aliasInput" placeholder="Enter your alias">
                <button id="joinButton">JOIN!</button>
            </div>
            <div id="playerList"></div>
        `;
    
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
        const joinButton = document.getElementById('joinButton');
        const aliasInput = document.getElementById('aliasInput');
        let isWebSocketOpen = false;
        let player_id;
        let alias = null;
        let games;
        const semisFirstPlayer = document.getElementById("semis-first-player")
        const semisSecondPlayer = document.getElementById("semis-second-player")
        const semisThirdPlayer = document.getElementById("semis-third-player")
        const semisFourthPlayer = document.getElementById("semis-fourth-player")
        const finalFirstPlayer = document.getElementById("final-first-player")
        const finalSecondPlayer = document.getElementById("final-second-player")
        const semisFirstPlayerScore = document.getElementById("semis-first-player-score")
        const semisSecondPlayerScore = document.getElementById("semis-second-player-score")
        const semisThirdPlayerScore = document.getElementById("semis-third-player-score")
        const semisFourthPlayerScore = document.getElementById("semis-fourth-player-score")
        const finalFirstPlayerScore = document.getElementById("final-first-player-score")
        const finalSecondPlayerScore = document.getElementById("final-second-player-score")
        const winnerPlayer = document.getElementById("winner-player")
        const winningMsg = document.getElementById("winning-msg")
        
        async function getAvatar(id, element){
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
                element.src = data.image;
            }
        }
            
        const ws = new WebSocket('wss://localhost:81/ws/tournament/');
        ws.onopen = function() {
            console.log("tournament WebSocket is open now.");
            isWebSocketOpen = true;
        };
        
        // Handle WebSocket errors
        ws.onerror = function(error) {
            console.error("Chat WebSocket error:", error);
        };
        
        // Handle WebSocket close
        ws.onclose = function() {
            console.log("closing websocket")
  
            isWebSocketOpen = false;
        };

        ws.onmessage = function(e) {
            const data = JSON.parse(e.data);
            if (data.action == "new_connection") {
                player_id = data.player_id
                console.log("new tournament connection: ", player_id)
            }
            else if (data.action == "status") {
                games = data.games
                status(data.games)
            }
            else if (data.action == "reset") {
                console.log("finished tourn")
                joinButton.style.display = "block"
                aliasInput.style.display = "block"
                resetPlayer(semisFirstPlayer, semisFirstPlayerScore)
                resetPlayer(semisSecondPlayer, semisSecondPlayerScore)
                resetPlayer(semisThirdPlayer, semisThirdPlayerScore)
                resetPlayer(semisFourthPlayer, semisFourthPlayerScore)
                resetPlayer(finalFirstPlayer, finalFirstPlayerScore)
                resetPlayer(finalSecondPlayer, finalSecondPlayerScore)
                winnerPlayer.removeAttribute('src');
                winnerPlayer.style.color = 'white'
                winnerPlayer.style.border = "3px solid rgb(255, 255, 255)";
                status(data.games)
            } 
            // else if (data.action == "notify") {
                // localStorage.setItem("tournamentNotification", "tournament game now");
            // }
        }
        
        function resetPlayer(playerElement, scoreElement) {
            scoreElement.style.color = "white";
            scoreElement.innerText = "0"
            playerElement.style.border = "3px solid rgb(255, 255, 255)";
            playerElement.removeAttribute('src');
            playerElement.style.visbility = 'hidden';
        }

        joinButton.addEventListener('click', (e) => {
            alias = aliasInput.value
            if (joinButton.innerText == "JOIN!") {
                if (isWebSocketOpen) {
                    const data = {
                        type: 'join',
                        player_id: player_id,
                        alias: alias
                    };
                    ws.send(JSON.stringify(data));
                }
            } else if (joinButton.innerText == "PLAY!"){
                if (isWebSocketOpen) {
                    const data = {
                        type: 'play',
                        player_id: player_id,
                        alias: alias
                    };
                    ws.send(JSON.stringify(data));
                }
                window.isTournament = true
                let round = getRound(games, player_id)
                window.aiAlias = getAiAlias(round, games, player_id)
                window.location.href = "#game-online"
            } else if (joinButton.innerText == "RESET!") {
                console.log("reset tournament")
                if (isWebSocketOpen) {
                    const data = {
                        type: 'reset',
                    };
                    ws.send(JSON.stringify(data));
                }
            }
        });

        function getAiAlias(round, games, id) {
            if (games[round][0]["id"] !== id) {
                return games[round][0]["alias"]
            } else {
                return games[round][1]["alias"]
            }
            // console.log("alias not found")
            // return null
        }

        function getRound(games, id) {
            for (let player of games["final"]) {
                if (player.id === id) {
                    return "final";
                }
            }
            for (let player of games["first_semis"]) {
                if (player.id === id) {
                    return "first_semis";
                }
            }
            for (let player of games["second_semis"]) {
                if (player.id === id) {
                    return "second_semis";
                }
            }
            return null
        }

        async function setPlayer(player, playerElement, scoreElement) {
            if (!playerElement || !scoreElement || !player) {
                return;
            }
            getAvatar(player["id"], playerElement)
            scoreElement.innerHTML = `${player["score"]}`
            if (player["result"] == "winner") {
                playerElement.style.border = "3px solid rgb(112, 174, 110)";
                scoreElement.style.color = "rgb(112, 174, 110)";
            }
            else if (player["result"] == "loser") {
                playerElement.style.border = "3px solid rgb(230, 59, 46)";
                scoreElement.style.color = "rgb(230, 59, 46)";
            }
        }
        function setWinner(winner) {
            if (!winner) {
                return
            }
            console.log("winner: ", winner)
            getAvatar(winner["id"], winnerPlayer)
            winnerPlayer.style.border = "3px solid rgb(255, 215, 0)";
        }

        function getPlayer(games, id) {
            for (let player of games["final"]) {
                if (player.id === id) {
                    return player;
                }
            }
            for (let player of games["first_semis"]) {
                if (player.id === id) {
                    return player;
                }
            }
            for (let player of games["second_semis"]) {
                if (player.id === id) {
                    return player;
                }
            }
        }
// when the user log out maybe unset his localstorage <------//////
        function status(games) {
            const first_semis = games.first_semis
            const second_semis = games.second_semis
            const final = games.final
            const winner = games.winner
            const player = getPlayer(games, player_id)
            console.log("game_status:", games["status"])
            if (player) {
                console.log("status: ", player.status)
                if(player.status == "waiting") {
                    console.log("waiting")
                    joinButton.style.display = "none"
                    aliasInput.style.display = "none"
                } else if(player.status == "ready") {
                    console.log("ready")
                    window.gameRoom = player["room_name"]
                    joinButton.style.display = "block"
                    joinButton.innerText = "PLAY!"
                    aliasInput.style.display = "none"
                    window.playerAlias = player["alias"]
                    localStorage.setItem("tournamentNotification", "tournament game now");
                } else if(player.status == "active") {
                    console.log("active")
                    localStorage.removeItem("tournamentNotification");
                    joinButton.style.display = "none"
                    aliasInput.style.display = "none"
                }
            } else if (games["status"] == "ongoing") {
                aliasInput.style.display = "none"
                joinButton.style.display = "none"
            } else if (games["status"] == "pending") {
                joinButton.style.display = "block"
                aliasInput.style.display = "block"
                joinButton.innerText = "JOIN!"
            } 
            if (games["status"] == "finished") {
                console.log("game finished")
                joinButton.innerText = "RESET!"
                joinButton.style.display = "block"
                aliasInput.style.display = "none"
                // joinButton.innerText = "PLAY!"
            }            
            console.log("first_semis: ", first_semis)
            console.log("second_semis: ", second_semis)
            console.log("final: ", final)
            setPlayer(first_semis[0], semisFirstPlayer, semisFirstPlayerScore)
            setPlayer(first_semis[1], semisSecondPlayer, semisSecondPlayerScore)
            setPlayer(second_semis[0], semisThirdPlayer, semisThirdPlayerScore)
            setPlayer(second_semis[1], semisFourthPlayer, semisFourthPlayerScore)
            setPlayer(final[0], finalFirstPlayer, finalFirstPlayerScore)
            setPlayer(final[1], finalSecondPlayer, finalSecondPlayerScore)
            setWinner(winner)
        }
    }
    // disconnectedCallback() {
        // Assume you have an existing WebSocket connection stored in `window.ws`
        // if (window.ws) {
        //     // Check if the WebSocket is open or connecting before trying to close it
        //     if (window.ws.readyState === WebSocket.OPEN || window.ws.readyState === WebSocket.CONNECTING) {
        //         // Close the WebSocket with a status code and an optional reason
        //         window.ws.close(1000);

        //         // Optionally, set the WebSocket to null to ensure it can be reconnected later
        //         window.ws = null;
        //         console.log("WebSocket closed from the front end.");
        //     }
        // }
        // localStorage.clear();
    // }
}

customElements.define('tournament-component', TournamentComponent);
