
function navigateTo(page) {
    // Clear the current content
    document.querySelector('.container').innerHTML = ``;
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'messenger':
            loadMessenger();
            break;
        case 'game':
            loadGame();
            break;
        case 'settings':
            loadSettings();
            break;
        case 'profile':
            loadProfile();
            break; 
    }
    history.pushState({ page: page }, '', page);
}
function loadProfile() {
    fetch('../profile/profile.html') // Path to your profile.html file
        .then(response => response.text()) // Extract the text from the response
        .then(html => {
            const profile = document.querySelector('.container');
            profile.innerHTML = html; // Set the innerHTML with the fetched content
        })
        .catch(error => {
            console.error('Error loading the profile:', error);
        });
}

function loadDashboard() {
    const dashboard = document.querySelector('.container');
    dashboard.innerHTML = `
        <div class="dashboard">
            <h1>Welcome to your dashboard!</h1>
            <p>Here you can see your recent activity and statistics.</p>
        </div>
    `;
}

function loadMessenger() {
    const messenger = document.querySelector('.container');
    messenger.innerHTML = `
        <div class="messenger">
            <h1>Welcome to your messenger!</h1>
            <p>Here you can chat with your friends.</p>
        </div>
    `;
}

function loadGame() {
    const game = document.querySelector('.container');
    game.innerHTML = `
        <div class="ping-pong">
	    	<h1>PING PONG</h1>
	    	<div class="scoreboard">
	    		<div class="player-profile" id="player1-profile">
	    			<img src="../game/miroka.svg" alt="Player 1" class="profile-pic">
	    			<p class="player-name">miroka</p>
	    		</div>
	    		<div class="score-display">
	    			<span id="score1">0</span> : <span id="score2">0</span>
	    		</div>
	    		<div class="player-profile" id="player2-profile">
	    			<img src="../game/droke.svg" alt="Player 2" class="profile-pic">
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
        const script = document.createElement('script');
        script.src = '../game/game.js';
        document.body.appendChild(script);
}

function loadSettings() {
    const settings = document.querySelector('.container');
    settings.innerHTML = `
        <div class="settings">
            <h1>Welcome to your settings!</h1>
            <p>Here you can change your account settings.</p>
        </div>
    `;
}

window.onpopstate = function(event) {
    if (event.state && event.state.page) {
        navigateTo(event.state.page);
    }
}