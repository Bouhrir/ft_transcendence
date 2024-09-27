const routes = {
    '': 'signin-component',
    'signin': 'signin-component',
    'signup': 'signup-component',
    'dashboard': 'dashboard-component',
    'game': 'game-component',
    'settings': 'settings-component',
    'profile': 'profile-component'
};

function navigate() {

    const path = window.location.hash.substring(1);
    const page = routes[path] || 'signin-component';
    console.log(path);
    if (((path === 'signin') || (path === 'signup'))) {
        const navbar = document.querySelector('navbar-component');
        if (navbar) {
            navbar.getElementById('navbar').style.display = 'none';
        }
    } else {
        const navbar = document.querySelector('navbar-component');
        if (navbar) {
            navbar.getElementById('navbar').style.display = 'block';
        }
    }
    document.getElementById('container').innerHTML = `<${page}></${page}>`;
}

window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', navigate);