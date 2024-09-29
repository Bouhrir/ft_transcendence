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

                <input type="submit" value="Save">
            </form>
        </div>
        `
        document.getElementById('2faButton').addEventListener('click', function() {
            let button = this;
            
            if (button.classList.contains('active')) {
                button.classList.remove('active');
                button.textContent = 'Enable 2FA';
            } else {
                button.classList.add('active');
                button.textContent = 'Disable 2FA';
            }
        });
    }
}
customElements.define('settings-component', SettingComponent);