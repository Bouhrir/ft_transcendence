class SettingComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div>
        <div class="whole">
            <div class="account-settings">
                <div class="acc_">
                    <h1>Account Settings</h1>
                    <div class="accord">
                        <a href="#profile">Profile</a>

                        <a id="2faButton" class="toggle-2fa">Enable 2FA</a>
                        <div id="verificationSection" style="display: none;">
                            <label for="verificationCode">Enter verification code:</label><br>
                            <input type="text" id="verificationCode" name="verificationCode"><br>
                            <button type="button" id="verifyButton">Verify</button>
                        </div>

                    </div>
                    <a class="delete" href="#">Delete Account</a>
                </div>
                <div class="line_"></div>
                <div class="acciformation">
                        <h1>Pesonal information</h1>
                        <div class="information_box">
                            <div class="editprof">
                                    <div class="editprof__">
                                        <button class="edit-pic">
                                            <img class="camera" src="../../needs/img/photo-camera.png" alt="Edit Profile Picture" class="icon">
                                            <img class="pic_p" src="../../needs/img/Rectangle 24.png" alt="Edit Profile Picture" class="icon">
                                        </button>
                                </div>
                            </div>
                            <div class="name_last">
                                <div class="first_name">
                                    <h3>First name</h3>
                                    <p>Abdelillah</p>
                                </div>
                                <div class="last_name">
                                    <h3>Last name</h3>
                                    <p>Mahdioui</p>
                                </div>
                            </div>
                            <div class="mail_nd_pass">
                                <div class="add_mail">
                                    <h3>Adress mail</h3>
                                    <p>mahdiouiabdou@gmail.com</p>
                                </div>
                                <div class="pass">
                                    <h3>Password</h3>
                                    <p>***</p>
                                </div>
                            </div>
                            <div class="edit_but">
                                <a class="hr" href="#signup"><button class="join">Save<span class="flech">→</span></button></a>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
        <div id="qrModal" class="modal" style="display: none;">
            <div class="modal-content">
                <span id="closeModal" class="close">&times;</span>
                <h2>Scan the QR Code</h2>
                <img id="qrCodeInModal" src="" alt="QR Code">
            </div>
        </div>
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
            const qrModal = document.getElementById('qrModal');
            const qrCodeInModal = document.getElementById('qrCodeInModal');
            const closeModal = document.getElementById('closeModal');
        
            let button = this;
            const verificationSection = document.getElementById('verificationSection');
            
            if (button.classList.contains('active')) {
                button.classList.remove('active');
                button.textContent = 'Enable 2FA';
                verificationSection.style.display = 'none';
            } else {
                button.classList.add('active');
                button.textContent = 'Disable 2FA';
                const access = getAccessTokenFromCookies();
                
                try {
                    const response = await fetch('http://localhost:81/2fa/setup/', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${access}`,
                            'Content-Type': 'application/json',
                        }
                    });
            
                    if (response.ok) {
                        const data = await response.json();
                        qrCodeInModal.src = data.qr_code_image; // Set QR code image in modal
                        qrModal.style.display = 'block'; // Show the modal
                        verificationSection.style.display = 'block';
                        this.totpSecret = data.totp_secret; // Store the TOTP secret for later use
                    } else {
                        console.error('Failed to set up 2FA:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error setting up 2FA:', error);
                }
            }
        
            // Close the modal when the "close" button is clicked
            closeModal.onclick = function() {
                qrModal.style.display = 'none';
            }
        
            // Close the modal when anywhere outside of it is clicked
            window.onclick = function(event) {
                if (event.target == qrModal) {
                    qrModal.style.display = 'none';
                }
            }
        });
        document.getElementById('verifyButton').addEventListener('click', async function() {
            const verificationCode = document.getElementById('verificationCode').value;
            console.log(verificationCode);
            const access = getAccessTokenFromCookies();

            try {
                const response = await fetch('http://localhost:81/2fa/verify/', {
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