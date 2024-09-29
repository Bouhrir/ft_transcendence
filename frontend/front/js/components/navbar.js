function createNavbar() {
	const navbar = document.createElement('div');
	navbar.className = 'navbar';
    navbar.innerHTML = `
		<header>
			<nav class="head">
				<img class="logo" src="../svg/logo.svg">
				<a href="#dashboard" >dashboard</a>
				<a href="#messenger" >messenger</a>
				<a href="#game" >game</a>
				<a href="#settings" >settings</a>
			</nav>
		</header>
    `;
	if (!document.querySelector('.navbar'))
		document.body.prepend(navbar);
}
