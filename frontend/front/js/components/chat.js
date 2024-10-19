class MessengerComponent extends HTMLElement {
    connectedCallback(){
        this.innerHTML = `
            <div id="chat-log"></div>
            <input id="chat-message-input" type="text" size="100">
            <input id="chat-message-submit" type="button" value="Send">
        `;
        // window.gameRoom = ""
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

        async function sendInvitation(inviteeUsername) {
            try {
                const response = await fetch('/chat/send-invitation/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Bearer ${access}`
                    },
                    body: `invitee_username=${inviteeUsername}`
                });
        
                // Check if the response is ok (status in the range 200-299)
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                const data = await response.json(); // Parse the JSON response
                return data; // Return the parsed data
            } catch (error) {
                console.error('Error:', error);
                return null; // Or handle the error as needed
            }
        }

        // sendInvitation("zaz")
        
        function deleteInvitation(username) {
            fetch('/chat/delete-invitations/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`
                },
                body: JSON.stringify({ invitee_username: username })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        console.error('Error response:', errorData);
                        throw new Error('Network response was not ok: ' + response.statusText);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('result: ', data);
                // Redirect or join the room using the room_name
                // window.location.href = `/game?room_name=${data.room_name}`; // Navigate to the game page
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
        // deleteInvitation("zaz")

        const roomName = "your_room_name";  // Replace with your room name
        const ws = new WebSocket('ws://localhost:81/ws/chat/');
        ws.onopen = function() {
            console.log("Chat WebSocket is open now.");
            // isWebSocketOpen = true;
        };

        // Handle WebSocket errors
        ws.onerror = function(error) {
            console.error("Chat WebSocket error:", error);
        };

        // Handle WebSocket close
        ws.onclose = function() {
            // isWebSocketOpen = false;
        };

        ws.onmessage = function(e) {
            const data = JSON.parse(e.data);
            console.log("received data: ", data.message)
            const messagesList = document.querySelector('#chat-log')
            const newMessageItem = document.createElement('p');
            newMessageItem.textContent = data.message;
            messagesList.appendChild(newMessageItem);
        };

        document.querySelector('#chat-message-input').focus();
        document.querySelector('#chat-message-input').onkeyup = function(e) {
            if (e.keyCode === 13) {  // Enter key
                document.querySelector('#chat-message-submit').click();
            }
        };
        // deleteInvitation("zaz")
        document.querySelector('#chat-message-submit').onclick = async function(e) {
            const messageInputDom = document.querySelector('#chat-message-input');
            const message = messageInputDom.value;
            // check if it's a command, if not broadcast it
            if (message === "/invite") {
                let invite = await sendInvitation("zaz")
                console.log(invite)
                window.gameRoom = invite.room_name
                window.location.href = `#game`;
            } else {
                ws.send(JSON.stringify({
                    'message': message
                }));
            }
            // return
            // console.log("sending")
            // messageInputDom.value = '';
        };
    }
}

customElements.define('messenger-component', MessengerComponent);