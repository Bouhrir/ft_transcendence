import { displayMsg, getAccessTokenFromCookies } from './help.js';
class SigninComponent extends HTMLElement {
    constructor() {
        super();
        this.is2FAEnabled = false;
    }
    async connectedCallback() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.remove();
        }
        this.innerHTML = `
            <div id="error-message" class="toaster"></div>
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
        const btn42 = document.getElementById('btn42');
        btn42.addEventListener('click', () => {
            window.location = 'http://localhost:81/auth/intra/';
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
        signin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorMessage = document.getElementById('error-message');
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

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
                await this.check2FAStatus(username);
                console.log(this.is2FAEnabled)
                if (!this.is2FAEnabled){
                    document.cookie = `access=${data.access}; path=/;`;
                    document.cookie = `refresh=${data.refresh}; path=/;`;
                    window.location.hash = '#dashboard';
                }
                else
                {
                    const signin = document.getElementById('signin');
                    signin.style.display = 'none';

                    const twofaVerifyTab = document.createElement('div');
                    twofaVerifyTab.className = 'sign2FA';
                    twofaVerifyTab.innerHTML = `
                        <h3>TWO FA VERIFICATION</h3>
                        <input id="twofaCode" type="text" placeholder="Enter your 2FA code" >
                        <button type="submit" id="twofa-verify-btn">Verify</button>
                        `;
                    document.body.append(twofaVerifyTab);
                    document.getElementById('twofa-verify-btn').addEventListener('click', async () => {
                        const verificationCode = document.getElementById('twofaCode').value;

                        console.log(verificationCode);
                        const response = await fetch('http://localhost:81/2fa/verify/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                username:username,
                                "verification_code":verificationCode
                            })
                        });
                        if (response.ok){
                            document.cookie = `access=${data.access}; path=/;`;
                            document.cookie = `refresh=${data.refresh}; path=/;`;
                            errorMessage.textContent = 'sucess verification!';
                            errorMessage.style.color = 'green';
                            twofaVerifyTab.style.display = 'none';
                            twofaVerifyTab.remove();
                            window.location.hash = '#dashboard';
                        }
                        else{
                            // twofaVerifyTab.remove();
                            errorMessage.textContent = 'failed verification!';
                            errorMessage.style.color = 'red';
                        }
                    });
                }

            } else {
				let errorMsg = '';
				if (!data.detail)
                	errorMsg = displayMsg(data);
				else
					errorMsg = 'Invalid username or password';
                errorMessage.textContent = errorMsg;
				errorMessage.style.backgroundColor = 'rgba(255, 69, 58, 0.9)';
            }
        });
    }

    async check2FAStatus(username) {
        try {
            const response = await fetch('http://localhost:81/2fa/status/', {
                method: 'POST',
                mode:'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({
                    username:username
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.is2FAEnabled = data.is_2fa_enabled;
            } else {
                console.error('Failed to get 2FA status:', response.statusText);
            }
        } catch (error) {
            console.error('Error checking 2FA status:', error);
        }
    }
}
customElements.define('signin-component', SigninComponent);