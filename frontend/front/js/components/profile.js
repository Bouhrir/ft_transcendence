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
                    <div class="ProfileImg"></div>
                    <h1>full Name</h1>
                    <p>username</p>
                    <p>LVL 9</p>
					<div class="AddFriends">
						<a href="#gamebar" class="join"> Add Friends<span class="flech">→</span></a>
						<a href="#messenger" class="join">Message<span class="flech">→</span></a>
					</div>
                </div>
                <div class="LastMatches">
                    <div class="MatchHistory">
                        <img src="../../needs/img/logo.png">
                        <p class="rate">10</p>
                        <p> - </p>
                        <p class="rate1">5</p>
                        <img src="../../needs/img/logo.png">
            </div>
                </div>
            </div>
            <div class="Matche">
                <h1>MATCHES</h1>
                <h3>W  /  L</h3>
                <p><span style="color:green;">10</span> - <span style="color:red;">0</span></p>
            </div>
        </div>
        `;
    }
}

customElements.define('profile-component', ProfileComponent);
