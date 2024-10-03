class SettingComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="settings">
            <form id="settingsForm">
                <h1>Settings</h1>
                <label for="profilePicture">Profile Picture:</label><br>
                <input type="file" id="profilePicture" name="profilePicture"><br>
                <button id="deletePicture">Delete Picture</button><br>

                <label for="username">modify username:</label><br>
                <input placeholder="username" type="text" id="username" name="username"><br>

                <label for="email">modify email:</label><br>
                <input placeholder="email" type="email" id="email" name="email"><br>
                
                <button type="button" id="2faButton" class="toggle-2fa">Enable 2FA</button><br>
                <img id="qrCode" style="display: none;"></img>
                
                <div id="verificationSection" style="display: none;">
                    <label for="verificationCode">Enter verification code:</label><br>
                    <input type="text" id="verificationCode" name="verificationCode"><br>
                    <button type="button" id="verifyButton">Verify</button>
                </div>

                <input type="submit" value="Save">
            </form>
        </div>
        `;

        function getAccessTokenFromCookies() {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith('access=')) {
                    return cookie.substring('access='.length);
                }
            }
            return null;
        }

        document.getElementById('2faButton').addEventListener('click', async function() {
            let button = this;
            const qrCodeImg = document.getElementById('qrCode');
            const verificationSection = document.getElementById('verificationSection');
            
            if (button.classList.contains('active')) {
                button.classList.remove('active');
                button.textContent = 'Enable 2FA';
                qrCodeImg.style.display = 'none';
                verificationSection.style.display = 'none';
            } else {
                button.classList.add('active');
                button.textContent = 'Disable 2FA';
                const access = getAccessTokenFromCookies();
                
                try {
                    const response = await fetch('http://localhost:8000/2fa/setup/', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${access}`,
                            'Content-Type': 'application/json',
                        }
                    });
            
                    if (response.ok) {
                        const data = await response.json();
                        qrCodeImg.src = data.qr_code_image;
                        qrCodeImg.style.display = 'block';
                        verificationSection.style.display = 'block';
                        this.totpSecret = data.totp_secret; // Store the TOTP secret for later use
                    } else {
                        console.error('Failed to set up 2FA:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error setting up 2FA:', error);
                }
            }
        });

        document.getElementById('verifyButton').addEventListener('click', async function() {
            const verificationCode = document.getElementById('verificationCode').value;
            console.log(verificationCode);
            const access = getAccessTokenFromCookies();

            try {
                const response = await fetch('http://localhost:8000/2fa/verify/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${access}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "totp_secret": this.totpSecret, // Use the stored TOTP secret
                        "verification_code": verificationCode
                    })
                });

                if (response.ok) {
                    alert('2FA verification successful!');
                    // Here you can update the UI to show that 2FA is now enabled
                } else {
                    alert('2FA verification failed. Please try again.');
                }
            } catch (error) {
                console.error('Error verifying 2FA:', error);
                alert('An error occurred during 2FA verification.');
            }
        });
    }
}

customElements.define('settings-component', SettingComponent);