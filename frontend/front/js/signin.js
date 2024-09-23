let div = document.createElement('div');
div.className = 'signin-form';
div.innerHTML = `
	<form id="signin">
		<h2>Signin</h2>
		<input type="text" id="username" placeholder="Username" required>
		<input type="password" id="password" placeholder="Password" required>
		<button type="submit">Sign-in</button>
        <p>Don't have an account?, <a>Sign up</a> </p>
	</form>`;
document.body.appendChild(div);

document.getElementById('signin').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    
        resp = fetch('https://0.0.0.0:8000/token/', {
        method: "POST",
        headers:{
            "content-type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    }).then(resp => resp.json())
    .then(data => {
        if (data.refresh && data.access) {
            localStorage.setItem('token', data.access);
            localStorage.setItem('token', data.refresh);
            window.location.href = '../start/game.html';
        } else {
            console.erre('Error:', data);
        }
    }).catsh(error => {
        console.error('Error:', error);
        alert("An error occurred");
    });
});