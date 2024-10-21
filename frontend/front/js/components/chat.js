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

        async function sendInvitation(inviteeId) {
            try {
                const response = await fetch('/chat/send-invitation/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Bearer ${access}` // Ensure 'access' is defined
                    },
                    body: `invitee_id=${inviteeId}`
                });
        
                // Handle non-OK responses (status outside the 200-299 range)
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Error ${response.status}: ${errorData.error}`);
                }
        
                const data = await response.json(); // Parse the JSON response
                return data; // Successfully return the parsed data
        
            } catch (error) {
                // Handle network or JSON parsing errors
                console.error('Error:', error.message);
                return null; // Return null or handle the error as needed
            }
        }
        
        async function acceptInvitation(inviterId) {
            try {
                const response = await fetch('/chat/accept-invitation/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Bearer ${access}` // Make sure 'access' is defined
                    },
                    body: `inviter_id=${inviterId}`
                });
        
                // Handle non-OK responses (status outside the 200-299 range)
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Error ${response.status}: ${errorData.error}`);
                }
                const data = await response.json(); // Try parsing JSON response
                return data; // Successfully return the parsed data
        
            } catch (error) {
                // Handle network or parsing errors
                console.error('Error:', error.message);
                return null; // Return null or handle the error as needed
            }
        }
        
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
                let invite = await sendInvitation(113)
                if (invite) {
                    console.log("invitation sent:", invite)
                    ws.send(JSON.stringify({
                        'message': "do you want to play against me?"
                    }));
                    window.gameRoom = invite.room_name
                    window.location.href = `#game-online`;
                } else {
                    ws.send(JSON.stringify({
                        'message': "you can't send this invitation"
                    }));
                }
            } else if (message === "/accept") {
                let invite = await acceptInvitation(114)
                if (invite) {
                    console.log("invitation accept:", invite)
                    window.gameRoom = invite.room_name
                    window.location.href = `#game-online`;
                } else {
                    ws.send(JSON.stringify({
                        'message': "invitation not found"
                    }));
                }
            } else {
                ws.send(JSON.stringify({
                    'message': message
                }));
            }
        };
    }
}
// inviter 114
// invitee 113

customElements.define('messenger-component', MessengerComponent);