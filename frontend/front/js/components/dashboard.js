import { checkJwt , getAccessTokenFromCookies, getuser} from './help.js';

class DashboardComponent extends HTMLElement {
    async connectedCallback() {
        this.innerHTML = `
        <div class="dashboard">
        <div class="cards">
            <div class="profile-card">
                <div class="trophie">
                    <h2>TROPHIE<br>2</h2>
                </div>
                <div class="profilepic">
                    <div>
                        <img id="ProfileImg" style="width:320px; height: 300px;">
                    </div>
                    <div>
                        <h1 id="fullName"></h1>
                        <p id="username"></p>
                    </div>
                </div>
                <div class="matches">
                    <h2>LAST MATCH<br><strong id="Score1"></strong> - <strong id="Score2"></strong></h2>
                </div>
            </div>
            <div class="cards">
                <div class="opengame-card">
                    <div class="open-txt">
                        <div>
                            <h3>PING PONG</h3>
                        </div>
                    </div>
                    <div class="start">
                        <a class="hr" href="#gamebar"><button class="join">start game<span class="flech">→</span></button></a>
                    </div>
                    <div class="racket">
                            <img src="../../needs/img/RACKET 1.png">
                    </div>
                </div>
            </div>
        </div>
        <div class="rank">
            <div class="rank-profile">
                <div class="lvl-card">
                    <div id="lvl-img1" class="lvl-img">
                        <img id="playerIMG1" src="#" style="width:190px; height: 180px;">
                        <p id="username1"></p>
                    </div>
                </div>
            </div>
            <div class="rank-profile">
                <div class="lvl-card">
                    <div id="lvl-img2" class="lvl-img">
                        <img id="playerIMG2" src="#" style="width:190px; height: 180px;">
                        <p id="username2"></p>
                    </div>
                </div>
            </div>
            <div class="rank-profile">
                <div class="lvl-card">
                    <div id="lvl-img3" class="lvl-img">
                        <img id="playerIMG3" src="#" style="width:190px; height: 180px;">
                        <p id="username3"></p>
                    </div>
                </div>
            </div>
            <div class="rank-profile">
                <div class="lvl-img">
                    <h3 class="HIGHEST">HIGHEST PRICE</h3>
                    <img src="../../needs/img/platinuim.png" width="200px" height="180px">
                    <h3 class="platinuim">platinuim</h3>
                </div>
            </div>
        </div>
        <div class="match-list">
            <h3>Last Matches</h3>
            <div id="match-list">
            </div>
        </div>
    </div>
        `;
        await this.fetchUserData();
        await this.fetchFriendsData();
		await this.LastMatches();
        await this.myMatch()
        // this.checkAuth();
    }

    async fetchUserData(){
        const access = getAccessTokenFromCookies('access');
        const fullName = document.getElementById('fullName');
        const username = document.getElementById('username');
        const imgProfile = document.getElementById('ProfileImg');

        const response = await fetch('http://localhost:81/auth/me/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
            const data = await response.json();
            console.log('id', data.id);

            fullName.textContent = data.first_name + ' ' + data.last_name;
            username.textContent = data.username;
            imgProfile.src = data.image;
            

        } else {
            console.error('Failed to fetch user data:', response.statusText);
        }
    }
    checkNoFriend(lvl){
        lvl.innerHTML = '';
        lvl.textContent = 'no friend'
    }
    async fetchFriendsData(){
        const playerIMG1 = document.getElementById('playerIMG1');
        const playerIMG2 = document.getElementById('playerIMG2');
        const playerIMG3 = document.getElementById('playerIMG3');
        const lvlimg1 = document.getElementById('lvl-img1')
        const lvlimg2 = document.getElementById('lvl-img2')
        const lvlimg3 = document.getElementById('lvl-img3')
        const access = getAccessTokenFromCookies('access');
        const response = await fetch('http://localhost:81/auth/get_friends_list/', {
            method: 'GET',
            headers:{
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
            },
        });
       
        if (response.ok){
            const data = await response.json()
            
            if (data[0]){
                getuser(data[0].id, playerIMG1)
                document.getElementById('username1').textContent = data[0].username;
            }
            else
                this.checkNoFriend(lvlimg1)

            if (data[1]){
                getuser(data[1].id, playerIMG2)
                document.getElementById('username2').textContent = data[1].username;
            }
            else
                this.checkNoFriend(lvlimg2)

            if (data[2]){
                document.getElementById('username3').textContent = data[2].username;
                getuser(data[2].id, playerIMG3)
            }
            else
                this.checkNoFriend(lvlimg3)
        }
        else
        {
            this.checkNoFriend(lvlimg1)
            this.checkNoFriend(lvlimg2)
            this.checkNoFriend(lvlimg3)
        }
      
    }
	async LastMatches(){
        const access = getAccessTokenFromCookies('access');
        const response = await fetch('http://localhost:81/auth/get_game_status/', {
            method: 'GET',
            headers:{
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
            },
        });
        if (response.ok){
            const data = await response.json();
            this.fillList(data);
        }
        else{
            const matchesContainer = document.getElementById('match-list');
            matchesContainer.textContent = 'No such matches';

        }
	}
    async myMatch(){
        const access = getAccessTokenFromCookies('access');
        const response = await fetch('http://localhost:81/auth/get_user_games/', {
            method: 'GET',
            headers:{
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
            },
        });
        if (response.ok){
            const data = await response.json();
            this.fillLast(data);
        }
    }
    fillList(data) {
        const matchesContainer = document.getElementById('match-list');
        matchesContainer.innerHTML = '';
    
        data.forEach(element => {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'match-orange';
    
            const img1 = document.createElement('img');
            img1.width = 60;
            img1.height = 60;
            getuser(element.host_id, img1);
            matchDiv.appendChild(img1);

            let rate = ''
            let rate1 = ''
            if (element.host_score > element.guest_score)
            {
                rate = 'rate'
                rate1 = 'rate1'
            }
            else 
            {
                rate = 'rate1'
                rate1 = 'rate'
            }
            
            const score1 = document.createElement('p');
            score1.className = rate;
            score1.textContent = element.host_score;
            matchDiv.appendChild(score1);
            
            const under = document.createElement('p');
            under.textContent = '-';
            matchDiv.appendChild(under);
            
            const score2 = document.createElement('p');
            score2.className = rate1;
            score2.textContent = element.guest_score;
            matchDiv.appendChild(score2);

            const img2 = document.createElement('img');
            img2.width = 60;
            img2.height = 60;
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

customElements.define('dashboard-component', DashboardComponent);