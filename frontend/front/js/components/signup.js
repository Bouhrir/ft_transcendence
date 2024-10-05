
class SignupComponent extends HTMLElement {
    connectedCallback() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.remove();
        }
        this.innerHTML = `
        <div class="logop">
            <img src="../../needs/img/logo.svg" class="oplogo">
        </div>
        <div class="signupbox" id="signup">
            <div class="email-txt">
                <h1 class="wlctxt">CREATE ACCOUNT</h1>
                <div class="btn42">
                    <button type="submit" class="logo42"><img src="../../needs/img/42logo.svg"></button>
                </div>
                <div class="line">
                    <h2 class="or">or</h2>
                </div>
                <h3>FULL NAME</h3>
                    <input id="firstname" type="text" class="email-input" placeholder="Enter your Firt Name" required>
                <h3>LAST NAME</h3>
                    <input id="lastname" type="text" class="email-input" placeholder="Enter your Last Name" required>
                <h3>Usernanme</h3>
                    <input id="username" type="text" class="email-input" placeholder="Enter your Usernanme" required>
                <h3>EMAIL</h3>
                    <input id="email" type="text" class="password-input" placeholder="Enter your Email" required>
                <h3>PASSWORD</h3>
                    <input id="password" type="password" class="password-input" placeholder="Enter your Password" required>
                <h3>CONFIRM PASSWORD</h3>
                    <input id="confirm_password" type="password" class="password-input" placeholder="Enter your Password" required>
                
                <div class="btnsign"> 
                    <form>
                    <button type="submit" class="loginbtn">Sign up</button>
                    </form>
                </div>
                <div class="dont">
                    <h2>Already have an account? <a href="#signin">Sign in<a></h2>
                </div>
            </div>
        </div>`;
        const signup = document.getElementById('signup');
        signup.addEventListener('submit', async (e) => {
            e.preventDefault();
            const firstname = document.getElementById('firstname').value;
            const lastname = document.getElementById('lastname').value;
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirm_password = document.getElementById('confirm_password').value;

            if (password !== confirm_password) {
                alert('Passwords do not match');
                return;
            }
            // Perform fetch to backend (Django server)
            const response = await fetch('http://localhost:81/auth/sign-up/', {
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