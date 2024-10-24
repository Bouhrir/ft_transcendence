import { displayMsg, getAccessTokenFromCookies, checkJwt } from "./help.js";


export async function createNavbar() {
	const navbar = document.createElement('div');
	navbar.className = 'navbar';
	navbar.innerHTML = `
	<header class="head">
		<div class="head1">
		<div class="menu">
			<button type="submit"><img src="../../needs/img/logo.svg"></button>
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
				<div id="notifications" class="notification">
					<img src="../../needs/img/Bell_pin_fill.png">
					<div id="resultRequest" style="display:none"></div>
				</div>
				<div class="logout">
						<button  id="logout" type="submit"><img src="../../svg/logout.svg"></button>
				</div>
				<div class="logout">
						<button id="darkModeToggle" type="submit"><img src="../../svg/darkNight.svg"></button>
				</div>
				<div class="profile" id="profile">
					<button type="submit"><img id="icon-img" width=5px height=5px src="#"></button>
				</div>
			</div>
		<div id="bold-point" class="bold-point" style="display:none"></div>
		</header>
    `;
	
	

	if (!document.querySelector('.navbar'))
		document.body.prepend(navbar);
	await checkJwt();
	search();
	profile();
	logout();
	darkMode();
	iconImg();
	notification()
}
function search(){
	const searchInput = document.getElementById('searchInput');
	const access = getAccessTokenFromCookies('access');
	const resultsContainer = document.getElementById('resultSearch');
	resultsContainer.style.display = 'none';
    searchInput.addEventListener('input', async () => {
        const query = searchInput.value;
        if (query.length > 1) {
            try {
                const response = await fetch(`https://localhost:81/auth/search/?q=${query}`, {
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
							const response = await fetch('https://localhost:81/auth/getuser/', {
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
							else{
								const data = await response.json();
								console.log(displayMsg(data));
							}
						})
                    });
                }
				else{
					const data = await response.json();
					displayMsg(data);
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
		await offline();
		const access = getAccessTokenFromCookies('access');
		try {
			const loggedout = await fetch('https://localhost:81/auth/logout/', {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${access}`,
					'Content-Type': 'application/json',
				}
			});
			if (loggedout.ok) {
				document.cookie = 'access=; expires=Thu, 01 Jan 2002 00:00:00 UTC; path=/;';
				document.cookie = 'refresh=; expires=Thu, 01 Jan 2002 00:00:00 UTC; path=/;';
				location.reload();
			}
		}
		catch (error) {
			console.error('Can`t Logout: ', error);
		}
	});
	
}
async function offline(){
	const access = getAccessTokenFromCookies('access');
	const response = await fetch('https://localhost:81/auth/offline/', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${access}`,
		},
	});
	if (response.ok) {
		console.log('set offline');
	}
	else {
		console.error('Failed to set offline:', response.statusText);
	}
}
// current profile 
function profile(){
	const profile = document.getElementById('profile');
	const access = getAccessTokenFromCookies('access');
	profile.addEventListener('click', async () => {
		const response = await fetch('https://localhost:81/auth/me/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
            }
        });
		const data = await response.json();
        if (response.ok) {
			window.location.href = `#profile/${data.id}`
		}
	});
}
async function iconImg(){
	const access = getAccessTokenFromCookies('access');
	const response = await fetch('https://localhost:81/auth/me/', {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${access}`,
			'Content-Type': 'application/json',
		}
	});
	const data = await response.json();

	if (response.ok) {
		const iconImg = document.getElementById('icon-img');
		iconImg.src = data.image;
	}
	else 
		displayMsg(data);

}
async function notification(){
	const access = getAccessTokenFromCookies('access');

	const response = await fetch('https://localhost:81/auth/get_friends_request/', {
		method: 'GET',
		headers:{
			'Authorization': `Bearer ${access}`,
			'Content-Type': 'application/json',
		},
	});
	if (response.ok) {
		const data = await response.json();
		const notificationsDiv = document.getElementById('resultRequest');
		notificationsDiv.innerHTML = '';
		if (data.length > 0) {
			activeNotification();
			data.forEach(friendRequest => {
				const friendRequestDiv = document.createElement('div');
				friendRequestDiv.className = 'request';
				friendRequestDiv.innerHTML = `<p><span>${friendRequest.username}</span> has sent you a friend request <button class="accept" id="accept">accept</button></p>`;

				notificationsDiv.prepend(friendRequestDiv);
				accept(notificationsDiv, friendRequestDiv, friendRequest.id);
			});
		}
	} else {
		console.error('Failed to fetch friend requests:', response.statusText);
	}
	

}

function accept(notificationsDiv, friendRequestDiv, id){
	const access = getAccessTokenFromCookies('access');
	const acceptButton = document.querySelector('.accept');
	acceptButton.addEventListener('click' ,async () =>{
		console.log('im in')
		const response = await fetch('https://localhost:81/auth/accept_friend/', {
			method: 'POST',
			headers:{
				'Authorization': `Bearer ${access}`,
				'Content-Type': 'application/json',
			},
			body:JSON.stringify({
				'friend_id':id,
			})
		});
		const data = await response.json()
		console.log("data accepted", data)
		if (response.ok){
			notificationsDiv.removeChild(friendRequestDiv);
		}
	});
}
function activeNotification(){
	document.getElementById('bold-point').style.display = 'block';
	document.getElementById('notifications').addEventListener('click', function() {
		const notificationsDiv = document.getElementById('resultRequest');
		if (notificationsDiv.style.display === 'none') {
			notificationsDiv.style.display = 'block';
		} else {
			notificationsDiv.style.display = 'none';
			document.getElementById('bold-point').style.display = 'none';
		}
	});
}
// Existing code for dark mode toggle
function darkMode(){
    const darkModeToggle = document.querySelector('#darkModeToggle');
    darkModeToggle.addEventListener('click', toggleDarkMode);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}