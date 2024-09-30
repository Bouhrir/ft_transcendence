class GameComponent extends HTMLElement {
	connectedCallback(){
		this.innerHTML = `
        
        `
				
	}
}

customElements.define('game-component', GameComponent);

