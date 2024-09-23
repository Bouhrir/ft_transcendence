let div = document.createElement('div');
div.className = 'signup-form';
div.innerHTML = `
	<form id="signup">
		<h2>Signin</h2>
		<input type="text" id="username" placeholder="Username" required>
		<input type="password" id="password" placeholder="Password" required>
		<button type="submit">Signup</button>
        <p>Don't have an account? </p><a>Signup</a>
	</form>`;
document.body.appendChild(div);

document.getElementById('signin').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    
    fetch('https://0.0.0.0:8000/token/', {
        method: "POST",
        headers:{
            "content-type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    }).then(resp => resp.json())
    // Launch the game
    window.location.href = '../start/game.html';
});