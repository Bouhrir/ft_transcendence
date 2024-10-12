function createNavbar() {
	const navbar = document.createElement('div');
	navbar.className = 'navbar';
	navbar.innerHTML = `
	<header class="head">
		<div class="head1">
		<div class="menu">
			<form action="#settings">
				<button type="submit"><img src="../../needs/img/logo.svg"></button>
			</form>
			<!-- <img class="logomenu" src="../../needs/img/logo.png"> -->
			<a href="#dashboard">Dashboard</a>
			<a href="#messenger">Messenger</a>
			<a href="#gamebar">Game</a>
			<a href="#settings">Settings</a>
		</div>
		</div>
		<div class="head2">
				<form class="searchpad">
					<input type="text" placeholder="Search...">
					<img src="../../needs/img/altsearch.svg" alt="Search Icon" class="search-icon">
				</form>
		</div>
			<div class="head3">
				<div class="notification">
					<form action="index.html">
						<button type="submit"><img src="../../needs/img/Bell_pin_fill.png"></button>
					</form>
				</div>
				<div class="logout">
					<a href="#signin">⇲</a>
				</div>
				<div class="profile">
					<form action="#profile">
						<button type="submit"><img src="../../needs/img/Rectangle 24.png"></button>
					</form>
				</div>
			</div>
		</header>
    `;
	if (!document.querySelector('.navbar'))
		document.body.prepend(navbar);
}
