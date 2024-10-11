
class TournamentComponent extends HTMLElement {
    constructor() {
        super();
        this.players = [];
        this.maxPlayers = 4;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `
            <div class="avatar-winner">
                <p>W I N N ER</p>
                <div class="av-win"></div>
            </div>
            <div class="tournament">
                <div class="lines">
                    <div class="avatar-player">
                        <div class="av-img"></div>
                        <span class="tourn-score">0</span>
                            <svg width="2" height="58" viewBox="0 0 2 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.01739 -0.000154686L2 113" stroke="white" stroke-width="2"/>
                            </svg>
                        <span class="tourn-score">0</span>
                        <div class="av-img"></div>
                    </div>
                    <div>
                        <svg width="114" height="468" viewBox="0 0 114 468" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M56.0002 234H113.628" stroke="white" stroke-width="2"/>
                            <path d="M0.000225067 1H57.6279" stroke="white" stroke-width="2"/>
                            <path d="M0.000225067 467H57.6279" stroke="white" stroke-width="2"/>
                            <line x1="57" y1="1" x2="57" y2="467" stroke="white" stroke-width="2"/>
                        </svg>
                    </div>

                    <div class="avatar-player">
                        <div class="av-img"></div>
                    </div>
                    <p class="tourn-score-final">0</p>
                </div>
                <div id="lineMiddle">
                    <div>
                        <svg width="58" height="2" viewBox="0 0 58 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M57.6277 1H0" stroke="white" stroke-width="2"/>
                        </svg>
                    </div>
                </div>
                <div class="lines">
                    <p class="tourn-score-final">0</p>
                    <div class="avatar-player">
                        <div class="av-img"></div>
                    </div>
                    <div>
                        <svg width="114" height="468" viewBox="0 0 114 468" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M57.6277 234H0" stroke="white" stroke-width="2"/>
                            <path d="M113.628 1H56" stroke="white" stroke-width="2"/>
                            <path d="M113.628 467H56" stroke="white" stroke-width="2"/>
                            <line y1="-1" x2="466" y2="-1" transform="matrix(4.37115e-08 1 1 -4.37115e-08 57.6279 1)" stroke="white" stroke-width="2"/>
                        </svg>
                    </div>
                    <div class="avatar-player" >
                        <div class="av-img"></div>
                        <span class="tourn-score">0</span>
                        <svg width="2" height="58" viewBox="0 0 2 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.01739 -0.000154686L2 113" stroke="white" stroke-width="2"/>
                        </svg>
                        <span class="tourn-score">0</span>
                        <div class="av-img"></div>
                    </div>
                </div>
            </div>
            <div class="controls">
                <input type="text" id="aliasInput" placeholder="Enter your alias">
                <button id="joinButton">JOIN!</button>
            </div>
            <div id="playerList"></div>
        `;
    }

    setupEventListeners() {
        const joinButton = this.querySelector('#joinButton');
        const aliasInput = this.querySelector('#aliasInput');

        joinButton.addEventListener('click', () => {
            const alias = aliasInput.value.trim();
            if (alias && this.players.length < this.maxPlayers) {
                this.addPlayer(alias);
                aliasInput.value = '';
                this.update();
            }
        });
    }

    addPlayer(alias) {
        this.players.push(alias);
        const slot = this.players.length - 1;
        const avatarImg = this.querySelector(`img[data-player-slot="${slot}"]`);
        if (avatarImg) {
            avatarImg.title = alias;
            avatarImg.style.border = '3px solid blue';
        }
    }

    update() {
        const joinButton = this.querySelector('#joinButton');
        const playerList = this.querySelector('#playerList');

        playerList.innerHTML = `<p style="font-family:'Baloo_Bhai_2';">Current player: ${this.players.join(', ')}</p>`;

        if (this.players.length >= this.maxPlayers) {
            joinButton.textContent = 'READY';
            joinButton.disabled = true;
        }
    }
}

customElements.define('tournament-component', TournamentComponent);