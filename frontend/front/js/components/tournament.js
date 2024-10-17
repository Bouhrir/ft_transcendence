
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
                <div class="av-win" id="winner-player"></div>
            </div>
            <div class="tournament">
                <div class="lines">
                    <div class="avatar-player">
                        <div class="av-img" id="semis-first-player"></div>
                        <span class="tourn-score" id="semis-first-player-score">0</span>
                            <svg width="2" height="58" viewBox="0 0 2 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.01739 -0.000154686L2 113" stroke="white" stroke-width="2"/>
                            </svg>
                        <span class="tourn-score" id="semis-second-player-score">0</span>
                        <div class="av-img" id="semis-second-player"></div>
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
                        <div class="av-img" id="final-first-player"></div>
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
                        <div class="av-img" id="final-second-player"></div>
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
                        <div class="av-img" id="semis-third-player"></div>
                        <span class="tourn-score" id="semis-third-player-score">0</span>
                        <svg width="2" height="58" viewBox="0 0 2 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.01739 -0.000154686L2 113" stroke="white" stroke-width="2"/>
                        </svg>
                        <span class="tourn-score" id="semis-fourth-player-score">0</span>
                        <div class="av-img" id="semis-fourth-player"></div>
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
        let alias;
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
        
        winnerPlayer.style.backgroundImage = "url('/needs/img/Rectangle 27.png')"

        function backFromGame() {
            if (window.isTournament) {
                console.log("back from game!!!")
                if (window.isWebSocketOpen) {
                    const data = {
                        type: 'back',
                        // player_id: player_id,
                        // alias: alias
                    };
                    window.ws.send(JSON.stringify(data));
                }
                window.isTournament = false
                joinButton.style.display = "none"
                aliasInput.style.display = "none"
            }
            // maybe make it false again
        }
        backFromGame()

        if (!window.isWebSocketOpen) {
            const ws = new WebSocket('ws://localhost:81/ws/tournament/');
            window.ws = ws
        }
        window.ws.onopen = function() {
            console.log("tournament WebSocket is open now.");
            window.isWebSocketOpen = true;
        };
        
        // Handle WebSocket errors
        window.ws.onerror = function(error) {
            console.error("Chat WebSocket error:", error);
        };
        
        // Handle WebSocket close
        window.ws.onclose = function() {
            console.log("closing websocket")
            isWebSocketOpen = false;
        };
        // document.get
        window.ws.onmessage = function(e) {
            const data = JSON.parse(e.data);
            if (data.action == "new_connection") {
                player_id = data.player_id
                console.log("new tournament connection: ", player_id)
                status(data.games)
            }
            else if (data.action == "redirect_game") {
                console.log("games prepared")
                joinButton.style.display = "block"
                joinButton.innerText = "PLAY!"
                aliasInput.style.display = "none"
                window.gameRoom = data.room
            }
            else if (data.action == "cancelled") {
                joinButton.style.display = "none"
            }
            else if (data.action == "status") {
                status(data.games)
            }
            else if (data.action == "nobody_won") {
                winningMsg.innerText = "nobody won"
            }
        }
        joinButton.addEventListener('click', (e) => {
            alias = aliasInput.value
            if (joinButton.innerText == "JOIN!") {
                if (window.isWebSocketOpen) {
                    const data = {
                        type: 'join',
                        player_id: player_id,
                        alias: alias
                    };
                    window.ws.send(JSON.stringify(data));
                }
                aliasInput.style.display = "none"
                joinButton.style.display = "none"
            } else if (joinButton.innerText == "PLAY!"){
                if (window.isWebSocketOpen) {
                    const data = {
                        type: 'play',
                        player_id: player_id,
                        alias: alias
                    };
                    window.ws.send(JSON.stringify(data));
                }
                window.isTournament = true
                window.location.href = "#game-online"
                // close socket when you leave the page
            }
            
        });
        
        // window.addEventListener('beforeunload', function() {
        // if (ws) {
        //         console.log("Closing WebSocket before page unload.");
        //         ws.close();  // Close the WebSocket connection
        //     }
        // });

        function setPlayer(player, playerElement, scoreElement) {
            // const avatar = getAvatar()
            // score
            // winner or loser
            // playerElement.style.backgroundImage = "url(${avatar})"
            if (!playerElement || !scoreElement) {
                console.error("Player or score element is not found in the DOM.");
                return;
            }
            if (!player) {
                return
            }
            scoreElement.innerHTML = `${player["score"]}`
            if (player["result"] == "winner") {
                playerElement.style.border = "3px solid rgb(112, 174, 110)";
            }
            else if (player["result"] == "loser") {
                playerElement.style.border = "3px solid rgb(230, 59, 46)";
            }
        }
        function status(games) {
            const first_semis = games.first_semis
            const second_semis = games.second_semis
            const final = games.final
            // get the picture of the player
            // if the tournament is ongoing or the player joined the tournament
            if (games["status"] == "ongoing") {
                aliasInput.style.display = "none"
                joinButton.style.display = "none"
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
        }
        
        
        
                    


        

        // async function createTournament() {
        //     try {
        //         const response = await fetch('/tournament/create_tournament/', {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 'Authorization': `Bearer ${accessToken}` // Include token if needed
        //             }
        //         });
        
        //         const data = await response.json();
        
        //         if (response.ok) {
        //             console.log('Tournament created:', data);
        //         } else {
        //             console.log('Error:', data.message);
        //         }
        //     } catch (error) {
        //         console.error('Error creating tournament:', error);
        //     }
        //     await progress()
        // }
        // // Call the function to create the tournament
        // createTournament();
        

        // async function progress() {
        //     try {
        //         const response = await fetch('/tournament/progress/', {
        //             method: 'GET',
        //             headers: {
        //                 'Content-Type': 'application/x-www-form-urlencoded',
        //                 'Authorization': `Bearer ${access}`
        //             },
        //         });
        
        //         // Check if the response is ok (status in the range 200-299)
        //         if (!response.ok) {
        //             throw new Error('Network response was not ok: ' + response.statusText);
        //         }
        //         const data = await response.json(); // Parse the JSON response
        //         return data; // Return the parsed data
        //     } catch (error) {
        //         console.error('Error:', error);
        //         return null; // Or handle the error as needed
        //     }
        // }
        
        function joinTournament() {

        }
    }
}

customElements.define('tournament-component', TournamentComponent);