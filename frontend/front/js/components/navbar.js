
class NavbarComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header>
		        <nav class="head">
		        	<img class="logo" src="../svg/logo.svg">
		        	<a href="#dashbord" >dashboard</a>
		        	<a href="#messenger" >messenger</a>
		        	<a href="#game" >game</a>
		        	<a href="#setting" >settings</a>
		        </nav>
	        </header>
        `;
    }
}

customElements.define('navbar-component', NavbarComponent);