import { checkJwt, getAccessTokenFromCookies } from "./help.js";

class ProfileComponent extends HTMLElement {
    async connectedCallback(){
        this.innerHTML = `
        <div class="profile-acc">
            <div class="Trophie">
                <p>HIGHEST PRICE</p>
                <img class="trophie-type" src="../../needs/img/platinuim.png"></img>
                <p>silver</p>
            </div>
            <div class="ProfileAndMatches">
                <div class="Profile1">
                    <img id="ProfileImg" class="ProfileImg"></img>
                    <h1 id="FullName" ></h1>
                    <p id="UserName"></p>
                    <p>LVL 9</p>
					<div id="addFriends" class="AddFriends">
						<a class="join"> Add Friends<span class="flech">→</span></a>
						<a href="#messenger" class="join">Message<span class="flech">→</span></a>
					</div>
                </div>
                <div class="LastMatches">
                    <div class="MatchHistory">
                        <img src="#"  width=60px height=60px>
                        <p class="Score">
                            <span>10</span> - <span>5</span>
                        </p>
                        <img src="#"  width=60px height=60px>
            </div>
                </div>
            </div>
            <div class="Matche">
                <h1>MATCHE</h1>
                <h3>W  /  L</h3>
                <p class="Score">
                    <span>10</span> - <span>0</span>
                </p>
            </div>
        </div>
        `;
        await this.fetchUserData();
    }
    async fetchUserData(){
        const access = getAccessTokenFromCookies('access');
        const imgProfile = document.getElementById('ProfileImg');
        const fullName = document.getElementById('FullName');
        const username = document.getElementById('UserName');

        
        const userId = window.location.hash.split('/')[1];
        console.log(userId)
        const response = await fetch('http://localhost:81/auth/getuser/', {
            method: 'POST',
            headers:{
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({
                'id':userId
            })
        });
        if (response.ok) {
            const data = await response.json();

            fullName.textContent = data.first_name + ' ' + data.last_name;
            username.textContent = data.username;
            imgProfile.src = data.image;
            if (userId === localStorage.getItem('id'))
            {
                const currentUser = document.getElementById('addFriends');
                currentUser.style.display = 'none';
            }
            this.chekcIsFriend(userId).then(isfriend => {
                this.pending(userId).then(check =>{
                    if (!check)
                        this.addFreinds(userId);
                    else if (!isfriend){
                        const addFriendButton = document.getElementById('addFriends');
                        addFriendButton.style.display = 'none'
                        const pendingButton = document.createElement('div');
                        pendingButton.className = 'join';
                        pendingButton.textContent = 'Pending';
                        addFriendButton.parentNode.appendChild(pendingButton);
                    }
                });
            });
        } else {
            console.error('Failed to fetch user data:', response.statusText);
        }
    }
    async chekcIsFriend(userId){
        const access = getAccessTokenFromCookies('access');
        const response = await fetch('http://localhost:81/auth/check_friend/', {
            method: 'POST',
            headers:{
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'friend_id': userId
            })
        });
        if (response.ok){
            const addFriendButton = document.getElementById('addFriends');
            addFriendButton.style.display = 'none';
            const acceptButton = document.createElement('div');
            acceptButton.className = 'join';
            acceptButton.textContent = 'FRIEND';
            addFriendButton.parentNode.appendChild(acceptButton);
            return true;
        }
        return false;
    }
    async addFreinds(userId){
        const addFriendButton = document.getElementById('addFriends');
        const access = getAccessTokenFromCookies('access');
        addFriendButton.addEventListener('click', async () => {
    
            const response = await fetch('http://localhost:81/auth/add_friend/', {
                method: 'POST',
                headers:{
                    'Authorization': `Bearer ${access}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'friend_id': userId
                })
            });
    
            if (response.ok) {
                addFriendButton.style.display = 'none';
                const pendingButton = document.createElement('div');
                pendingButton.className = 'join';
                pendingButton.textContent = 'Pending';
                addFriendButton.parentNode.appendChild(pendingButton);
            } else {
                console.error('Failed to send friend request:', response.statusText);
            }
        });
    }
    async pending(userId){
        const access = getAccessTokenFromCookies('access');
        const response = await fetch('http://localhost:81/auth/pending/', {
            method: 'POST',
            headers:{
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'friend_id': userId
            })
        });
        if (response.ok)
            return true
        else
            return false
    }
 
}

customElements.define('profile-component', ProfileComponent);
