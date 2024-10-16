import { getAccessTokenFromCookies } from "./help.js";
export function createNavbar() {
	const navbar = document.createElement('div');
	navbar.className = 'navbar';
	navbar.innerHTML = `
	<header class="head">
		<div class="head1">
		<div class="menu">
			<button id="darkModeToggle" type="submit"><img src="../../needs/img/logo.svg"></button>
			<a href="#dashboard">Dashboard</a>
			<a href="#messenger">Messenger</a>
			<a href="#gamebar">Game</a>
			<a href="#settings">Settings</a>
		</div>
		</div>
		<div class="head2">
			<div class="searchpad">
        			<input id="searchInput" type="text" placeholder="Search...">
        			<img src="../../needs/img/altsearch.svg">
					<div id="resultSearch"></div>
				</div>
		</div>
			<div class="head3">
				<div class="notification">
					<form action="index.html">
						<button id="dark" type="submit"><img src="../../needs/img/Bell_pin_fill.png"></button>
					</form>
				</div>
				<div class="logout">
						<button  id="logout" type="submit"><img src="../../svg/logout.svg"></button>
				</div>
				<div class="profile" id="profile">
					<button type="submit"><img src="../../needs/img/Rectangle 24.png"></button>
				</div>
			</div>
		</header>
    `;
	
	

	if (!document.querySelector('.navbar'))
		document.body.prepend(navbar);
	logout();
	search();
	profile();
	darkMode();
}
function search(){
	const searchInput = document.getElementById('searchInput');
	const access = getAccessTokenFromCookies('access');
	const resultsContainer = document.getElementById('resultSearch');
	resultsContainer.style.display = 'none';
    searchInput.addEventListener('input', async () => {
        const query = searchInput.value;
        if (query.length > 2) {
            try {
                const response = await fetch(`http://localhost:81/auth/search/?q=${query}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${access}`,
                    }
                });

                if (response.ok) {
					resultsContainer.style.display = 'block';
                    const users = await response.json();
					resultsContainer.innerHTML = '';
                    users.forEach(user => {
                        const userElement = document.createElement('div');
                        userElement.className = 'user-result';
                        userElement.innerHTML = `
                            <h2>${user.username}</h2>
                            <p>${user.email}</p>
                        `;
                        resultsContainer.appendChild(userElement);
						userElement.addEventListener('click', async () => {
							const response = await fetch('http://localhost:81/auth/getuser/', {
								method: 'POST',
            					headers:{
                					'Authorization': `Bearer ${access}`,
                					'Content-Type': 'application/json',
            					},
            					body:JSON.stringify({
									'id':user.id
								})
							});
							if (response.ok){
								window.location.hash = `#profile/${user.id}`;
								
							}
						})
                    });
                }
            }
            catch (error) {
                console.error('Can`t search: ', error);
            }
        }
    });
}

//logout 
function logout(){
	const logout = document.getElementById('logout');
	logout.addEventListener('click', async () => {
		const access = getAccessTokenFromCookies('access');
		try {
			const loggedout = await fetch('http://localhost:81/auth/logout/', {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${access}`,
					'Content-Type': 'application/json',
				}
			});
			if (loggedout.ok) {
				document.cookie = 'access=; expires=Thu, 01 Jan 2002 00:00:00 UTC; path=/;';
				document.cookie = 'refresh=; expires=Thu, 01 Jan 2002 00:00:00 UTC; path=/;';
			}
		}
		catch (error) {
			console.error('Can`t Logout: ', error);
		}
	});
	
}

function profile(){
	const profile = document.getElementById('profile');
	const access = getAccessTokenFromCookies('access');
	profile.addEventListener('click', async () => {
		const response = await fetch('http://localhost:81/auth/me/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
			const data = await response.json();
			window.location.href = `#profile/${data.id}`
		}
	});
}

//dark mode activate
function darkMode(){
	const darkModeToggle = document.querySelector('#darkModeToggle');
    darkModeToggle.addEventListener('click', toggleDarkMode);
}
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
	const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}