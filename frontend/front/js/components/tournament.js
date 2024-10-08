
class tournamentComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="tournament">
                <div class="lines">
                    <div class="avatar-player">
                        <img src="../../needs/img/Rectangle 26.png" width=80%>
                        <img src="../../needs/img/Rectangle 26.png" width=80%>
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
                        <img src="../../needs/img/Rectangle 26.png" width=80%>
                    </div>
                </div>

                <div id="lineMiddle">
                    <div id="winner-avatar"class="avatar-player">
                        <img src="../../needs/img/Rectangle 26.png" width=80%>
                    </div>
                    <div>
                        <svg width="58" height="2" viewBox="0 0 58 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M57.6277 1H0" stroke="white" stroke-width="2"/>
                        </svg>
                    </div>
                </div>
                <div class="lines">
                    <div class="avatar-player">
                        <img src="../../needs/img/Rectangle 26.png" width=80%>
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
                        <img src="../../needs/img/Rectangle 26.png" width=80%>
                        <img src="../../needs/img/Rectangle 26.png" width=80%>
                    </div>
                </div>
                
            </div>`;






    }
}
customElements.define('tournament-component', tournamentComponent);