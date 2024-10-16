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
				<form class="searchpad">
					<input type="text" placeholder="Search...">
					<img src="../../needs/img/altsearch.svg" alt="Search Icon" class="search-icon">
				</form>
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
				<div class="profile">
					<form action="#profile">
						<button type="submit"><img src="../../needs/img/Rectangle 24.png"></button>
					</form>
				</div>
			</div>
		</header>
    `;
	
	

	if (!document.querySelector('.navbar'))
		document.body.prepend(navbar);
	
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
				// alert('Logout Successful');
				window.location.href = '#signin';
				document.cookie = 'access=; expires=Thu, 01 Jan 2002 00:00:00 UTC; path=/;';
				document.cookie = 'refresh=; expires=Thu, 01 Jan 2002 00:00:00 UTC; path=/;';
			}
		}
		catch (error) {
			console.error('Can`t Logout: ', error);
		}
	});
	const darkModeToggle = document.querySelector('#darkModeToggle');
    darkModeToggle.addEventListener('click', toggleDarkMode);
	
}


function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    // Save user's preference
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}