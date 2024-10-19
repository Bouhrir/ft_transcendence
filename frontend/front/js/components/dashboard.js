import { checkJwt , getAccessTokenFromCookies} from './help.js';

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
                        <p>LV9</p>
                    </div>
                </div>
                <div class="matches">
                    <h2>Matches<br><strong class="win">10</strong> - <strong class="lose">5</strong></h2>
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
                        <a class="hr" href="#game"><button class="join">start game<span class="flech">→</span></button></a>
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
                    <div class="lvl-img">
                        <p class="level">54%</p><img id="playerIMG1" src="#" style="width:190px; height: 180px;">
                    </div>
                    <div>
                        <p>obouhrir</p>
                        <p>LV9</p>
                    </div>
                </div>
            </div>
            <div class="rank-profile">
                <div class="lvl-card">
                    <div>
                        <div class="lvl-img">
                            <p class="level">54%</p><img id="playerIMG2" src="#" style="width:190px; height: 180px;">
                        </div>
                        <p>amdouyah</p>
                        <p>LV9</p>
                    </div>
                </div>
            </div>
            <div class="rank-profile">
                <div class="lvl-card">
                    <div class="lvl-img">
                        <p class="level">54%</p><img id="playerIMG3" src="#" style="width:190px; height: 180px;">
                    </div>
                    <div>
                        <p>amdouyah</p>
                        <p>LV9</p>
                    </div>
                </div>
            </div>
            <div class="rank-profile">
                <h3 class="HIGHEST">HIGHEST PRICE</h3>
                <div class="price">
                    <img src="../../needs/img/platinuim.png">
                </div>
                <h3 class="platinuim">platinuim</h3>
            </div>
        </div>
        <div class="last-matches">
            <div class="match-list">
                <div class="match-txt">
                    <h3>Last Matches</h3>
                    <a href="#">view all matches</a>
                </div>
                <div class="match-green-card">
                    <img src="#" width=60px height=60px>
                    <p class="rate1">5</p>
                    <p> - </p>
                    <p class="rate">10</p>
                    <img src="#" width=60px height=60px>
                </div>
                <div class="match-red-card">
                    <img src="#" width=60px height=60px>
                    <p class="rate1">10</p>
                    <p> - </p>
                    <p class="rate">5</p>
                    <img src="#" width=60px height=60px>
                </div>
            </div>
        </div>
    </div>
        `;
		await checkJwt();
        await this.fetchUserData();
        await this.fetchFriendsData();
		await this.LastMatches()
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
    async getuser(id, player){
        const access = getAccessTokenFromCookies('access');
        const response = await fetch('http://localhost:81/auth/getuser/', {
            method: 'POST',
            headers:{
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({
               'id':id
            })
        });
        if (response.ok){
            const data = await response.json();
            player.src = data.image;
        }
    }

    async fetchFriendsData(){
        const player1 = document.getElementById('playerIMG1');
        const player2 = document.getElementById('playerIMG2');
        const player3 = document.getElementById('playerIMG3');
        // this.getuser(69, player1);
        // this.getuser(75, player2);
        // this.getuser(70, player3);
      
    }
	async LastMatches(){
		//fetch last matches
	}
    
}

customElements.define('dashboard-component', DashboardComponent);