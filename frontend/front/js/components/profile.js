class ProfileComponent extends HTMLElement {
    async connectedCallback(){
        this.innerHTML = `
        <div class="profile-acc">
            <div class="Trophie">
                <p>HIGHEST PRICE</p>
                <div class="trophie-type"></div>
                <p>silver</p>
            </div>
            <div class="ProfileAndMatches">
                <div class="Profile1">
                    <img id="ProfileImg" class="ProfileImg"></img>
                    <h1 id="FullName" ></h1>
                    <p id="UserName"></p>
                    <p>LVL 9</p>
					<div class="AddFriends">
						<a href="#gamebar" class="join"> Add Friends<span class="flech">→</span></a>
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
        const access = this.getAccessTokenFromCookies();
        const imgProfile = document.getElementById('ProfileImg');
        const fullName = document.getElementById('FullName');
        const username = document.getElementById('UserName');


        const response = await fetch('http://localhost:81/auth/me/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
            const data = await response.json();

            fullName.textContent = data.first_name + ' ' + data.last_name;
            username.textContent = data.username;
            imgProfile.src = data.image;
            

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

customElements.define('profile-component', ProfileComponent);
