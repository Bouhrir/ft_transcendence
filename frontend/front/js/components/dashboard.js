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
                        <img src="../../needs/img/Rectangle 24.png">
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
                        <p class="level">54%</p><img src="../../needs/img/Rectangle 25.png">
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
                            <p class="level">54%</p><img src="../../needs/img/Rectangle 26.png">
                        </div>
                        <p>amdouyah</p>
                        <p>LV9</p>
                    </div>
                </div>
            </div>
            <div class="rank-profile">
                <div class="lvl-card">
                    <div class="lvl-img">
                        <p class="level">54%</p><img src="../../needs/img/Rectangle 26.png">
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
                <div class="match-red-card">
                    <img src="../../needs/img/logo.png">
                    <p class="rate">10</p>
                    <p> - </p>
                    <p class="rate1">5</p>
                    <img src="../../needs/img/logo.png">
                </div>
                <div class="match-red-card">
                    <img src="../../needs/img/logo.png">
                    <p class="rate">10</p>
                    <p> - </p>
                    <p class="rate1">5</p>
                    <img src="../../needs/img/logo.png">
                </div>
                <div class="match-red-card">
                    <img src="../../needs/img/logo.png">
                    <p class="rate">10</p>
                    <p> - </p>
                    <p class="rate1">5</p>
                    <img src="../../needs/img/logo.png">
                </div>
                <div class="match-green-card">
                    <img src="../../needs/img/logo.png">
                    <p class="rate1">5</p>
                    <p> - </p>
                    <p class="rate">10</p>
                    <img src="../../needs/img/logo.png">
                </div>
                <div class="match-red-card">
                    <img src="../../needs/img/logo.png">
                    <p class="rate">10</p>
                    <p> - </p>
                    <p class="rate1">5</p>
                    <img src="../../needs/img/logo.png">
                </div>
                <div class="match-green-card">
                    <img src="../../needs/img/logo.png">
                    <p class="rate1">5</p>
                    <p> - </p>
                    <p class="rate">10</p>
                    <img src="../../needs/img/logo.png">
                </div>
                <div class="match-red-card">
                    <img src="../../needs/img/logo.png">
                    <p class="rate">10</p>
                    <p> - </p>
                    <p class="rate1">5</p>
                    <img src="../../needs/img/logo.png">
                </div>
                <div class="match-green-card">
                    <img src="../../needs/img/logo.png">
                    <p class="rate1">5</p>
                    <p> - </p>
                    <p class="rate">10</p>
                    <img src="../../needs/img/logo.png">
                </div>
                <div class="match-red-card">
                    <img src="../../needs/img/logo.png">
                    <p class="rate">10</p>
                    <p> - </p>
                    <p class="rate1">5</p>
                    <img src="../../needs/img/logo.png">
                </div>
                <div class="match-red-card">
                    <img src="../../needs/img/logo.png">
                    <p class="rate">10</p>
                    <p> - </p>
                    <p class="rate1">5</p>
                    <img src="../../needs/img/logo.png">
                </div>
            </div>
        </div>
    </div>
        `;
        await this.fetchUserData();
        // this.checkAuth();
    }


    async fetchUserData(){
        const access = this.getAccessTokenFromCookies();
        const fullName = document.getElementById('fullName');
        const username = document.getElementById('username');

        const response = await fetch('http://localhost:81/auth/me/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
            const data = await response.json();
            console.log(data.id);

            fullName.textContent = data.first_name + ' ' + data.last_name;
            username.textContent = data.username;

        } else {
            console.error('Failed to fetch user data:', response.statusText);
        }
    }

    
    getAccessTokenFromCookies() {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith('access=')) {
                return cookie.substring('access='.length);
            }
        }
        return null;
    }
}

customElements.define('dashboard-component', DashboardComponent);