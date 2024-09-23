let div = document.createElement('div');
div.className = 'signup-form';
div.innerHTML = `
	<form id="signup">
		<h2>Signup</h2>
		<input type="text" id="username" placeholder="Username" required>
		<input type="email" id="email" placeholder="Email" required>
		<input type="password" id="password" placeholder="Password" required>
		<input type="password" id="confirm_password" placeholder="Confirm Password" required>
		<button type="submit">Signup</button>
	</form>`;
document.body.appendChild(div);


document.getElementById('signup').addEventListener('submit', async function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirm_password').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {
        const response = await fetch('http://0.0.0.0:8000/sign-up/', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        if (response.status !== 201) {
            alert("Error: Username already exists"); // You can also log the actual error message
            console.log(response);
        } else {
            console.log(response);
			window.location.href = '../start/game.html';
        }

    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred");
    }
});
