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
                <div class="LastMatches">lastmatches</div>
            </div>
            <div class="Matche">
                matches
            </div>
        </div>
        `;
    }
}


customElements.define('profile-component', ProfileComponent);
