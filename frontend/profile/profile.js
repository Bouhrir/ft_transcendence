
function navigateTo(page) {
    // Clear the current content
    document.querySelector('.container').innerHTML = '';
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
    }
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
        <div class="game">
            <h1>Welcome to the game!</h1>
            <p>Here you can play games.</p>
        </div>
    `;
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