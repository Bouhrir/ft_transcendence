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
                    <p>fullName</p>
                    <p>username</p>
                    <p>LVL 9</p>
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
