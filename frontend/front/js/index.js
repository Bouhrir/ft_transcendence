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
            alert("Error: " + (await response.text())); // You can also log the actual error message
        } else {
            alert("Account created");
        }

    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred");
    }
});
