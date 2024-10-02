 class SettingComponent extends HTMLElement {

    connectedCallback(){
        this.innerHTML =`
        <div class="settings">
            <form id="settingsForm">
                <h1>Settings</h1>
                <label for="profilePicture">Profile Picture:</label><br>
                <input type="file" id="profilePicture" name="profilePicture"><br>
                <button id="deletePicture">Delete Picture</button><br>

                <label for="username" >modify username:</label><br>
                <input placeholder="username" type="text" id="username" name="username"><br>

                <label for="email">modify email:</label><br>
                <input placeholder="email" type="email" id="email" name="email"><br>
                
                <button type="button" id="2faButton" class="toggle-2fa">Enable 2FA</button><br>
                <img id="qrCode"></img>

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
            
            if (button.classList.contains('active')) {
                button.classList.remove('active');
                button.textContent = 'Disable 2FA';
            } else {
                button.classList.add('active');
                button.textContent = 'Enable 2FA';
                const access = getAccessTokenFromCookies();
                console.log('-----settings-----');
                console.log(access);
                try {
                    const response = await fetch('http://localhost:8000/2fa/setup/', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${access}`, // Authorization header with JWT
                            'Content-Type': 'application/json',
                        }
                    });
            
                    if (response.ok) {
                        const data = await response.json();
                        document.getElementById('qrCode').src = data.qr_code_image; // Set the QR code image in your HTML
                        console.log("tootp");
                        console.log('TOTP Secret:', data.totp_secret); // Optionally show the secret
                    } else {
                        console.error('Failed to set up 2FA:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error setting up 2FA:', error);
                }
            }
        });
    }
}
customElements.define('settings-component', SettingComponent);