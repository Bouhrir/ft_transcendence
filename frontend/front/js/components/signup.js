class SignupComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="signup-form">
            <form id="signup">
            	<h2>Register</h2>
            	<input type="text" id="username" placeholder="Username" required>
            	<input type="email" id="email" placeholder="Email" required>
            	<input type="password" id="password" placeholder="Password" required>
            	<input type="password" id="confirm_password" placeholder="Confirm Password" required>
            	<button class="IN" type="submit">Sign up</button>
                <p>back to <a href="#signin">Sign in?</a></p>
            </form>
        </div>`;
        const signup = document.getElementById('signup');
        signup.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirm_password = document.getElementById('confirm_password').value;

            if (password !== confirm_password) {
                alert('Passwords do not match');
                return;
            }
            // Perform fetch to backend (Django server)
            const response = await fetch('http://127.0.0.1:8000/auth/sign-up/', {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username:username,
                    email:email,
                    password:password,
                    confirm_password:confirm_password
                })
            });

            if (response.status === 201) {
                window.location.hash = '#dashboard';
            } else {
                alert('signup failed');
            }
        });
    }
}
customElements.define('signup-component', SignupComponent);