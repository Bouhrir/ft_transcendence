class MessengerComponent extends HTMLElement {
    connectedCallback(){
        
        this.innerHTML = `
        <div id="chat-container">
            <div id="message-display">
            <!-- Messages will appear here -->
            </div>
            <div id="chat-input">
                <input type="text"  id="message" placeholder="Type a message..." />
                <button id="send" type="submit">test</button>
            </div>
        </div>
        `;


        document.getElementById('send').addEventListener('click', async function(e) {
            e.preventDefault();

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
        const access = getAccessTokenFromCookies();
        let data;
        const response = await fetch('http://localhost:81/auth/me/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access}`,
                    'Content-Type': 'application/json',
                },
            });
        if (response.ok){
            data = await response.json();;
        }
        const currentUserId = data.id;
        const currentUserName = data.username;


        const receiverId = data.id;
        const receiverName = data.username;

        const roomName = 'gamechat';


        const socket = new WebSocket(
            'ws://'
            + window.location.host
            + '/ws/'
            + roomName
            + '/'
        );
        socket.onopen = function(e) {
            console.log('WebSocket is open now.');
            sendMessage();
        };
        socket.onmessage =function(event){
            const data = JSON.parse(event.data);
            console.log(data);
            if (data.snd_id === receiverId && data.rec_id === currentUserId) {
                // Display the message
                const messageDisplay = document.getElementById('message-display');
                messageDisplay.innerHTML += `<p>${data.msg}</p>`;
                 //const newMessage = document.createElement('p');
               // newMessage.textContent = data.message;
                //messageDisplay.appendChild(newMessage);
                messageDisplay.scrollTop = messageDisplay.scrollHeight;
            }
        }
        
        function sendMessage() {
            const message = document.getElementById('message').value;
            console.log(message, currentUserId, receiverId);

            if (message.trim() !== "") {
                // Send the message through the WebSocket if it is open
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({
                        'msg': message,
                        'snd_id': currentUserId,
                        'rec_id': receiverId,
                    }));
                    document.getElementById('message').value = '';
                } else {
                    console.log('WebSocket is not open.');
                }
            }
        }
        
    });
    
}

        

        // Define receiverId and receiverName based on your application logic
}

customElements.define('messenger-component', MessengerComponent);