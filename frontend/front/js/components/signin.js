class SigninComponent extends HTMLElement {
    connectedCallback() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.remove();
        }
        this.innerHTML = `
            <div id="error-message" class="error-message"></div>
            <div class="logop">
            <img src="../../needs/img/logo.svg" class="oplogo">
            </div>
            <div class="signinbox" id="signin">
                <div>
                    <h1 class="wlctxt">Welcome back</h1>
                    <h3 class="wlcmtxt">Welcome back ! Please enter your details.</h3>
                </div>
                <div class="email-txt">
                    <h3>EMAIL OR USERNAME</h3>
                    <input id="username" type="text" class="email-input" placeholder="Enter your email">
                    <h3>PASSWORD</h3>
                    <input  id="password" type="password" class="password-input" placeholder="Enter your Password">
                    <div class="rem-for">
                        <label><input type="checkbox">remember me</label>
                        <a href="#" >forgot password?</a>
                    </div>
                </div>
                <div>
                    <form action="#dashboard">
                        <button type="submit" class="loginbtn">Sign in</button>
                    </form>
                </div>
                <div class="line">
                    <h2 class="or">or</h2>
                </div>
                <div class="btn42">
                    <button id="btn42" type="submit" class="logo42"><img src="../../needs/img/42logo.svg"></button>
                </div>
                <div class="dont">
                    <h2>Don’t have an account? <a href="#signup">Sign up<a></h2>
                </div>
            </div>`;

        const signin = document.getElementById('signin');
        signin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorMessage = document.getElementById('error-message');
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const oauth = document.getElementById('btn42').value;

            // Perform fetch to backend (Django server)
            const response = await fetch('http://localhost:81/auth/sign-in/', {
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
                console.log('-----sign-----');
                console.log(data.access);
                window.location.hash = '#dashboard';
            } else {
                console.log (data);
                let errorMsg = '';

                for (const field in data) {
                    if (data.hasOwnProperty(field)) {
                        if (!data.detail)
                            errorMsg += `${field}: ${data[field].join(', ')}\n`;
                        else if(data.detail)
                            errorMsg = 'error: invalid username or password';
                    }
                }
                errorMessage.textContent = errorMsg;
            }
        });
    }
}
customElements.define('signin-component', SigninComponent);