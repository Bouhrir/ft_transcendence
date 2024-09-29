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

function navigate() {
    const path = window.location.hash.substring(1);
    const page = routes[path] || 'signin-component';
    console.log(page);
    if (page !== 'signin-component' && page !== 'signup-component') {
        createNavbar();
    }
    document.getElementById('container').innerHTML = `<${page}></${page}>`;
}

window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', navigate);

