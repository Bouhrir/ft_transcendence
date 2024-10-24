
class SignupComponent extends HTMLElement {
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
        <div id="signup">
            <div class="signupbox" id="signup">
                <div class="email-txt">
                        <h1 class="wlctxt">CREATE ACCOUNT</h1>
                        <div class="btn42" id="btn42">
                            <button  type="submit" class="logo42"><img src="../../needs/img/42logo.svg"></button>
                        </div>
                        <div class="line">
                            <h2 class="or">or</h2>
                        </div>
                        <h3>FIRST NAME</h3>
                            <input id="firstname" type="text" class="email-input" placeholder="Enter your Firt Name" required>
                        <h3>LAST NAME</h3>
                            <input id="lastname" type="text" class="email-input" placeholder="Enter your Last Name" required>
                        <h3>USERNAME</h3>
                            <input id="username" type="text" class="email-input" placeholder="Enter your Username" required>
                        <h3>EMAIL</h3>
                            <input id="email" type="text" class="password-input" placeholder="Enter your Email" required>
                        <h3>PASSWORD</h3>
                            <input id="password" type="password" class="password-input" placeholder="Enter your Password" required>
                        <h3>CONFIRM PASSWORD</h3>
                            <input id="confirm_password" type="password" class="password-input" placeholder="Enter your Password" required>
                        
                        <form class="btnsign"> 
                            <button type="submit" class="loginbtn">Sign up</button>
                        </form>
                        <div class="dont">
                            <h2>Already have an account? <a href="#signin">Sign in<a></h2>
                        </div>
                    </div>
                </div>
        </div>`;
        const btn42 = document.getElementById('btn42');
        btn42.addEventListener('click', (e) => {
            e.preventDefault();
            window.location = 'https://localhost:81/auth/intra/';
        });
        window.addEventListener('load', () => {
            const url = new URL(window.location.href);
            const key = url.hash.slice(1); // This will remove the '#' character
            if (key === 'true') {
                window.location.hash = '#dashboard';
            }
            if (key === 'false'){
                console.log('field intra42 Login')
                window.location.href = '#signin';
            }
        });
        const signup = document.getElementById('signup');
        signup.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorMessage = document.getElementById('error-message');
            const firstname = document.getElementById('firstname').value;
            const lastname = document.getElementById('lastname').value;
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirm_password = document.getElementById('confirm_password').value;

            if (password !== confirm_password) {
                const errorMsg = 'Passwords do not match';
                errorMessage.textContent = errorMsg;
                return;
            }
            // Perform fetch to backend (Django server)
            const response = await fetch('https://localhost:81/auth/sign-up/', {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    first_name: firstname,
                    last_name: lastname,
                    email: email,
                    password: password,
                    intra:'False',
                })
            });

            const data = await response.json();
            if (response.ok) {
                window.location.hash = '#signin';
            } else {
                let errorMsg = '';

                for (const field in data) {
                    if (data.hasOwnProperty(field)) {
                        if (!data.detail)
                            errorMsg += `${field}: ${data[field].join(', ')}\n`;
                        else if(data.detail)
                            errorMsg = data.detail;
                        else
                            errorMsg = 'error';
                    }
                }
                errorMessage.textContent = errorMsg;
            }
        });
    }
}
customElements.define('signup-component', SignupComponent);