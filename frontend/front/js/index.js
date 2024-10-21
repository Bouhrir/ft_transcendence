import { createNavbar } from "./components/navbar.js"
import {checkJwt, getAccessTokenFromCookies} from './components/help.js'

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

async function navigate() {
    const path = window.location.hash.substring(1);
    let page = routes[path] || 'signin-component';
    if (path.startsWith('profile')) {
        const userId = path.split('/')[1]; 
        page = 'profile-component';
        window.userId = userId;
    }
    console.log(page);

    if (page !== 'signin-component' && page !== 'signup-component') {
        await checkJwt();
        createNavbar();
    }
    if (getAccessTokenFromCookies('refresh')) {
        document.getElementById('container').innerHTML = `<${page}></${page}>`;
    } else if (page !== 'signin-component' && page !== 'signup-component') {
        console.log("token not found")
        window.location.hash = '#signin';
    } else {
        document.getElementById('container').innerHTML = `<${page}></${page}>`;
    }

}
//dark mode activate
function checkAndApplyDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
}
document.addEventListener('DOMContentLoaded', checkAndApplyDarkMode);

window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', navigate);

