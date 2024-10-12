
class TournamentComponent extends HTMLElement {
    // constructor() {
    //     super();
    //     this.players = [];
    //     this.maxPlayers = 4;
    // }

    connectedCallback() {

        this.innerHTML = `
            <div class="avatar-winner">
                <p>W I N N ER</p>
                <div class="av-win"></div>
            </div>
            <div class="tournament">
                <div class="lines">
                    <div class="avatar-player">
                        <div class="av-img"></div>
                        <span class="tourn-score">0</span>
                            <svg width="2" height="58" viewBox="0 0 2 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.01739 -0.000154686L2 113" stroke="white" stroke-width="2"/>
                            </svg>
                        <span class="tourn-score">0</span>
                        <div class="av-img"></div>
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
                        <div class="av-img"></div>
                    </div>
                    <p class="tourn-score-final">0</p>
                </div>
                <div id="lineMiddle">
                    <div>
                        <svg width="58" height="2" viewBox="0 0 58 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M57.6277 1H0" stroke="white" stroke-width="2"/>
                        </svg>
                    </div>
                </div>
                <div class="lines">
                    <p class="tourn-score-final">0</p>
                    <div class="avatar-player">
                        <div class="av-img"></div>
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
                        <div class="av-img"></div>
                        <span class="tourn-score">0</span>
                        <svg width="2" height="58" viewBox="0 0 2 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.01739 -0.000154686L2 113" stroke="white" stroke-width="2"/>
                        </svg>
                        <span class="tourn-score">0</span>
                        <div class="av-img"></div>
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
        const ws = new WebSocket('ws://localhost:81/ws/tournament/');
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
            isWebSocketOpen = false;
        };

        ws.onmessage = function(e) {
            // console.log("please")
            const data = JSON.parse(e.data);
            if (data.action == "new_connection") {
                player_id = data.player_id
                console.log("new connection: ", player_id)
            }
            // else if (data.action == "game") {
            // }
            else if (data.action == "redirect_game") {
                window.gameRoom = data.room
                window.location.href = "#game-online"
            }
        };
        
        joinButton.addEventListener('click', (e) => {
            alias = aliasInput.value
            console.log(alias)
            if (isWebSocketOpen) {
                const data = {
                    type: 'join',
                    player_id: player_id,
                    alias: alias
                };
                ws.send(JSON.stringify(data));
            }
        });




        

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