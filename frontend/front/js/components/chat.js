class MessengerComponent extends HTMLElement {
    connectedCallback(){
        this.innerHTML = `
        <section>
            <div>
                <h1>messenger</h1>
                <p>Welcome to the messenger</p>
                <!-- Fetch user data from backend -->
            </div>
        </section>
        `;
    
    }
}

customElements.define('messenger-component', MessengerComponent);