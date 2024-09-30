class SigninComponent extends HTMLElement {
    connectedCallback() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.remove();
        }
        this.innerHTML = `
        <div class="signin-form">
            <form id="signin">
                <h2>Sign In</h2>
                <input type="text" id="username" placeholder="Username" required>
                <input type="password" id="password" placeholder="Password" required>
                <button class="IN" type="submit">Sign In</button>
                <p>Don't have an account? <a href="#signup">Sign up</a></p>
                <a href="#forgot-password">Forgot password?</a>
            </form>
        </div>`;
        const signin = document.getElementById('signin');
        signin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Perform fetch to backend (Django server)
            const response = await fetch('http://127.0.0.1:8000/auth/sign-in/', {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username:username,
                    password:password
                })
            });

            const data = await response.json();

            if (response.ok) {
                document.cookie = `access=${data.access}; path=/; secure; samesite=strict`;
				document.cookie = `refresh=${data.refresh}; path=/; secure; samesite=strict`;
                window.location.hash = '#dashboard';
            } else {
                alert('signin failed');
            }
        });
    }
}
customElements.define('signin-component', SigninComponent);