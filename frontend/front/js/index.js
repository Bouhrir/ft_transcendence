const routes = {
    '': 'signin-component',
    'signin': 'signin-component',
    'signup': 'signup-component',
    'dashboard': 'dashboard-component',
    'messenger': 'messenger-component',
    'game': 'game-component',
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
        // If the user is not logged in and they're not trying to access the sign-in or sign-up pages, redirect to the sign-in page
        window.location.hash = '#signin';
    } else {
        // If the user is not logged in but they're trying to access the sign-in or sign-up pages, allow them to do so
        document.getElementById('container').innerHTML = `<${page}></${page}>`;
    }
}

window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', navigate);

