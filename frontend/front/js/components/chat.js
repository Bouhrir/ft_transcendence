class MessengerComponent extends HTMLElement {
    connectedCallback(){
        this.innerHTML = `
        <section>
            <div id="chat-container">
                <div id="chat-messages"></div>
                    <form id="chat-form">
                        <input type="text" id="chat-input" placeholder="Type a message..." required>
                        <button type="submit">Send</button>
                    </form>
                </div>
        </section>
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

        
        const access = getAccessTokenFromCookies();

        // Define receiverId and receiverName based on your application logic
        
        document.getElementById('chat-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const message = document.getElementById('chat-input').value;
            
            const response = await fetch('http:///auth/me/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok){
                const data = await response.json();
                
                const currentUserId = data.id;
                const currentUserName = data.username;
                const receiverId = 22;
                const receiverName = 'haha';

                console.log(currentUserId+ ' '+ currentUserName);

                const socket = new WebSocket(`ws://localhost:81/ws/chat/${currentUserId}/${receiverId}/`);

                socket.onopen = function(e) {
                    console.log('Connected to WebSocket');
                    displaySystemMessage(`Connected as ${currentUserName}. Chatting with ${receiverName}.`);
                };

                socket.onmessage = function(event) {
                    const data = JSON.parse(event.data);
                    displayMessage(message, data.snd_id === currentUserId);
                };

                socket.onclose = function(event) {
                    if (event.wasClean) {
                        console.log(`Closed cleanly, code=${event.code}, reason=${event.reason}`);
                    }
                };
            }
        });
        function displayMessage(message, isSent) {
            const messageElement = document.createElement('div');
            messageElement.textContent = `${isSent ? currentUserName : receiverName}: ${message}`;
            messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
            document.getElementById('chat-messages').appendChild(messageElement);
            messageElement.scrollIntoView({ behavior: 'smooth' });
        }
        
        function displaySystemMessage(message) {
            const messageElement = document.createElement('div');
            messageElement.textContent = message;
            messageElement.className = 'message system';
            document.getElementById('chat-messages').appendChild(messageElement);
            messageElement.scrollIntoView({ behavior: 'smooth' });
        }
        
    
    }
}

customElements.define('messenger-component', MessengerComponent);