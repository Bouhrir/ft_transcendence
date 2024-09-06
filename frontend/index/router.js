
console.log('salam ana amine');
const route = (event) => {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, '', event.target.href);
    handLocation();
};

const routes = {
    // '/login': 'login/login.html',
    404: '404.html',
    '/profile': '/profile/profile.html',
    // '/contact': 'contact',
};

const handLocation = async () =>{
    const path = window.location.pathname;
    const page = routes[path] || routes[404 ];
    const html = await (await fetch(page)).then((data) => data.text());
    document.getElementById("main-nav").innerHTML = html;
}

windown.onpopstate = handLocation;
window.route = route;

handLocation();
