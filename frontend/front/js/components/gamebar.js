class gameBar extends HTMLElement {
    connectedCallback() {
       this.innerHTML = `
       <div id="gameBar">
            <p id="gameOffline" class="gameLine"><a href="#game">OFFLINE<a/></p>
            <p id="gameOnline" class="gameLine"><a href="#game-tournement">TOURNAMENT<a/></p>
       </div>
       `;
        
    }
}
customElements.define('game-bar', gameBar);