import { checkJwt, getAccessTokenFromCookies , getuser} from "./help.js";

class ProfileComponent extends HTMLElement {
    async connectedCallback(){
        this.innerHTML = `
        <div class="profile-acc">
            <div class="Trophie">
                <p>HIGHEST PRICE</p>
                <img class="trophie-type" src="../../needs/img/platinuim.png"></img>
                <p>silver</p>
            </div>
            <div class="ProfileAndMatches" id="ProfileAndMatches">
                <div class="Profile1" id="profile1">
                    <img id="ProfileImg" class="ProfileImg"></img>
                    <h1 id="FullName" ></h1>
                    <p id="UserName"></p>
					<div id="addFriends" class="AddFriends">
						<a class="join"> Add Friends<span class="flech">→</span></a>
						<a href="#messenger" class="join">Message<span class="flech">→</span></a>
					</div>
                </div>
                <div class="LastMatches" id="LastMatches">
                </div>
            </div>
            <div class="Matche">
                <h1>MATCHE</h1>
                <h3>W  /  L</h3>
                <p class="Score">
                    <span id="Score1"></span> - <span id="Score2"></span>
                </p>
            </div>
        </div>
        `;
        await this.fetchUserData();
        await this.LastMatches();
    }
    async fetchUserData(){
        const access = getAccessTokenFromCookies('access');
        const imgProfile = document.getElementById('ProfileImg');
        const fullName = document.getElementById('FullName');
        const username = document.getElementById('UserName');

        
        const userId = window.location.hash.split('/')[1];
        console.log(userId)
        const response = await fetch('https://localhost:81/auth/getuser/', {
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
                        pendingButton.textContent = 'PENDING';
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
        const response = await fetch('https://localhost:81/auth/check_friend/', {
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
    
            const response = await fetch('https://localhost:81/auth/add_friend/', {
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
        const response = await fetch('https://localhost:81/auth/pending/', {
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
    
    async LastMatches(){
        const access = getAccessTokenFromCookies('access');
        const response = await fetch('https://localhost:81/auth/get_user_games/', {
            method: 'GET',
            headers:{
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
            },
        });
        if (response.ok){
            const data = await response.json();
            this.fillList(data);
            this.fillLast(data);
        }
        else{
            const matchesContainer = document.getElementById('LastMatches');
            matchesContainer.style.fontFamily = 'Bungee';
            matchesContainer.textContent = 'No such matches';
        }
    }
    fillList(data) {
        const matchesContainer = document.getElementById('LastMatches');
        matchesContainer.innerHTML = '';
    
        data.forEach(element => {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'MatchHistory';
            if (element.host_score > element.guest_score){
                matchDiv.style.background = 'linear-gradient(to left,rgba(21, 255, 0, 0.200),rgba(21, 255, 0, 0.0))'
                matchDiv.style.borderRight = 'rgb(9, 255, 0) solid 4px'
            }

                
            const img1 = document.createElement('img');
            img1.width = 70;
            img1.height = 70;
            getuser(element.host_id, img1);
            matchDiv.appendChild(img1);

            
            const score = document.createElement('p');
            score.className = 'Score';

            const score1 = document.createElement('span')
            score1.textContent = element.host_score;
            score.appendChild(score1)

            const under = document.createElement('p');
            under.textContent = '-';
            score.appendChild(under);
            
            const score2 = document.createElement('span')
            score2.textContent = element.guest_score;
            score.appendChild(score2)
            
            matchDiv.appendChild(score);

            const img2 = document.createElement('img');
            img2.width = 70;
            img2.height = 70;
            getuser(element.guest_id, img2);
            matchDiv.appendChild(img2);
    
            matchesContainer.appendChild(matchDiv);
        });
    }
    fillLast(data){
        const score1 = document.getElementById('Score1');
        const score2 = document.getElementById('Score2');

        score1.textContent = data[0].host_score
        score2.textContent = data[0].guest_score
    }

 
}

customElements.define('profile-component', ProfileComponent);
