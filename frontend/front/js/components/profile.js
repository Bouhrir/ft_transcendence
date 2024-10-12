class ProfileComponent extends HTMLElement {
    async connectedCallback(){
        this.innerHTML = `
        <div>
            matche
        </div>
        <div>
            <div>profile</div>
            <div>lastmatchess</div>
        </div>
        <div>
            trophie
        </div>
        `;
    }
}


customElements.define('profile-component', ProfileComponent);
