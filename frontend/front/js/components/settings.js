class SettingComponent extends HTMLElement {
    constructor() {
        super();
        this.is2FAEnabled = false;
        this.userData = null;
    }

    async connectedCallback() {
        this.innerHTML = `
        <div id="error-message" class="error-message"></div>
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
                    <a class="delete" id="deluser" href="#signin">Delete Account</a>
                </div>
                <div class="line_"></div>
                <div class="acciformation">
                        <h1>Personal information</h1>
                        <div class="information_box">
                            <div class="editprof">
                                    <div class="editprof__">
                                        <button class="edit-pic">
                                            <img class="camera" src="../../needs/img/photo-camera.png" alt="Edit Profile Picture" class="icon">
                                            <img class="pic_p" src="../../needs/img/Rectangle 24.png" alt="Edit Profile Picture" class="icon">
                                        </button>
                                    </div>
                            </div>
                            <div class="acclist">
                                <div class="name_last">
                                    <div class="first_name">
                                        <h3>First name</h3>
                                        <input type="text" class="sett_save" id="firstName" value="">
                                    </div>
                                    <div class="last_name">
                                        <h3>Last name</h3>
                                        <input type="text" class="sett_save" id="lastName" value="">
                                    </div>
                                </div>
                                <div class="mail">
                                    <div class="add_mail">
                                        <h3>Address mail</h3>
                                            <input type="email" class="sett_mail" id="email" value="">
                                    </div>
                                 </div>
                                 <div class="n_pass">
                                    <div class="add_mail">
                                        <h3>Current Password</h3>
                                            <input type="password" class="sett_save" id="CPassword" placeholder="enter current password">
                                        </div>
                                        <div class="pass">
                                            <h3>New Password</h3>
                                            <input type="password" class="sett_save" id="NPassword" placeholder="enter new password">
                                        </div>
                                 </div>
                                <div class="edit_but">
                                    <a class="hr"><button id="save" class="join">Save<span class="flech">→</span></button></a>
                                </div>
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

        await this.check2FAStatus();
        await this.fetchUserData();
        this.setValues()
        this.setupEventListeners();
    }
    setValues() {
        if (this.userData) {
            document.getElementById('firstName').value = this.userData.first_name || '';
            document.getElementById('lastName').value = this.userData.last_name || '';
            document.getElementById('email').value = this.userData.email || '';
        }
    }
    displayMsg(data){
        let Msg = '';
        for (const field in data) {
            if (data.hasOwnProperty(field)) {
                if (Array.isArray(data[field])) {
                    Msg += `${field}: ${data[field].join(', ')}\n`;
                } else {
                    Msg += `${field}: ${data[field]}\n`;
                }
            }
        }
        return Msg
    }
    async fetchUserData() {
        const access = this.getAccessTokenFromCookies();
        try {
            const response = await fetch('http://localhost:81/auth/me/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                this.userData = await response.json();
                console.log(this.userData.id);
            } else {
                console.error('Failed to fetch user data:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }
    async check2FAStatus() {
        const access = this.getAccessTokenFromCookies();
        try {
            const response = await fetch('http://localhost:81/2fa/status/', {
                method: 'GET',
                mode:'cors',
                headers: {
                    'Authorization': `Bearer ${access}`,
                    'Content-Type': 'application/json',
                }
            });


            if (response.ok) {
                const data = await response.json();
                this.is2FAEnabled = data.is_2fa_enabled;
                this.update2FAButton();
            } else {
                console.error('Failed to get 2FA status:', response.statusText);
            }
        } catch (error) {
            console.error('Error checking 2FA status:', error);
        }
    }

    update2FAButton() {
        const button = document.getElementById('2faButton');
        button.textContent = this.is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA';
    }

    setupEventListeners() {
        document.getElementById('2faButton').addEventListener('click', this.handle2FAToggle.bind(this));
        document.getElementById('verifyButton').addEventListener('click', this.handleVerification.bind(this));
        document.getElementById('save').addEventListener('click', this.handleSave.bind(this));
        document.getElementById('deluser').addEventListener('click', this.deleteuser.bind(this));
    }
    
    async handle2FAToggle() {
        const access = this.getAccessTokenFromCookies();
        const qrModal = document.getElementById('qrModal');
        const qrCodeInModal = document.getElementById('qrCodeInModal');
        const verificationSection = document.getElementById('verificationSection');
        const closeModal = document.getElementById('closeModal'); // Add this line
        const toast = document.getElementById('error-message');

        console.log(this.is2FAEnabled);
        if (!this.is2FAEnabled) {
            try {
                const response = await fetch('http://localhost:81/2fa/setup/', {
                    method: 'GET',
                    mode:'cors',
                    headers: {
                        'Authorization': `Bearer ${access}`,
                        'Content-Type': 'application/json',
                    }
                });
                console.log('setup', this.is2FAEnabled);
                if (response.ok) {
                    const data = await response.json();
                    qrCodeInModal.src = data.qr_code_image;
                    qrModal.style.display = 'block';
                    verificationSection.style.display = 'block';
                    closeModal.addEventListener('click', () => {
                        qrModal.style.display = 'none';
                    });

                    this.totpSecret = data.totp_secret;
                } else {
                    console.error('Failed to set up 2FA:', response.statusText);
                }
            } catch (error) {
                console.error('Error setting up 2FA:', error);
            }
        } else {
            try {
                const response = await fetch('http://localhost:81/2fa/disable/', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${access}`,
                        'Content-Type': 'application/json',
                    }
                });
                console.log('disable', this.is2FAEnabled);
                if (response.ok) {
                    toast.color = 'green';
                    toast.textContent = '2FA has been disabled';
                    this.is2FAEnabled = false;
                    this.update2FAButton();
                    verificationSection.style.display = 'none';
                } else {
                    console.error('Failed to disable 2FA:', response.statusText);
                }
            } catch (error) {
                console.error('Error disabling 2FA:', error);
            }
        }
    }

    async handleVerification() {
        const verificationCode = document.getElementById('verificationCode').value;
        const toast = document.getElementById('error-message');
        const access = this.getAccessTokenFromCookies();

        try {
            const response = await fetch('http://localhost:81/2fa/verify/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "verification_code": verificationCode
                })
            });
            const data = await response.json();
            let msg = this.displayMsg(data);
            console.log(msg);
            console.log('verify', this.is2FAEnabled);
            if (response.ok) {
                toast.color = 'green';
                toast.textContent = msg;
                this.is2FAEnabled = true;
                this.update2FAButton();
                document.getElementById('verificationSection').style.display = 'none';
                document.getElementById('qrModal').style.display = 'none';
            } else {
                toast.textContent = msg;
                this.is2FAEnabled = false;
                toast.color = 'red';
            }
        } catch (error) {
            console.error('Error verifying 2FA:', error);
            toast.textContent =  error;
        }
    }

    async handleSave() {
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const current_password = document.getElementById('CPassword').value;
        const new_password = document.getElementById('NPassword').value;
        const toast = document.getElementById('error-message');
        const access = this.getAccessTokenFromCookies();

        try {
            const response = await fetch('http://localhost:81/auth/update_profile/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    password:current_password,
                    new_password:new_password
                })
            });
            const data = await response.json();
            let Msg = this.displayMsg(data);
            
            if (response.ok) {
                toast.textContent = Msg;
                toast.color = 'green';
            } else {
                toast.textContent =  Msg;
            }
        } catch (error) {

            console.error('Error updating profile:', error);
            toast.textContent = error;
        }
    }

    async deleteuser(){
        // const access = this.getAccessTokenFromCookies();
        // try{
        //     const deluser = await fetch('http://localhost:81/auth/deluser/', {
        //         method : 'DELETE',
        //         header:{
        //             'Authorization': `Bearer ${access}`,
        //             'Content-Type': 'application/json',
        //         }
        //     });
        //     if (deluser.ok){
        //         alert('userdeleted');
        //     }
        document.cookie = 'access=; expires=Thu, 01 Jan 2002 00:00:00 UTC; path=/;';
        document.cookie = 'refresh=; expires=Thu, 01 Jan 2002 00:00:00 UTC; path=/;';
        // }
        // catch(error){
        //     console.error('can`t delete user: ', error);
        // }
    }

    getAccessTokenFromCookies() {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith('access=')) {
                return cookie.substring('access='.length);
            }
        }
        return null;
    }
}

customElements.define('settings-component', SettingComponent);