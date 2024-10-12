const routes = {
    '': 'signin-component',
    'signin': 'signin-component',
    'signup': 'signup-component',
    'dashboard': 'dashboard-component',
    'messenger': 'messenger-component',
    'gamebar':'game-bar',
    'game': 'game-component',
    'game-online': 'game-component-online',
    'tournament':'tournament-component',
    'settings': 'settings-component',
    'profile': 'profile-component'
};

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

function navigate() {
    const path = window.location.hash.substring(1);
    const page = routes[path] || 'signin-component';
    console.log(page);
    if (page !== 'signin-component' && page !== 'signup-component') {
        createNavbar();
    }
    if (getAccessTokenFromCookies()) {
        document.getElementById('container').innerHTML = `<${page}></${page}>`;
    } else if (page !== 'signin-component' && page !== 'signup-component') {
        console.log("token not found")
        window.location.hash = '#signin';
    } else {
        document.getElementById('container').innerHTML = `<${page}></${page}>`;
    }
}

window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', navigate);

