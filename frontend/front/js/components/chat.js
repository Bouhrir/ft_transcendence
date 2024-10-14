class MessengerComponent extends HTMLElement {
   async connectedCallback(){
        this.innerHTML = `
        <div id="chat-container">
            <div class="chat">
                <div id="left_side">
                    <h2>Friends</h2>
                    <div id="archive">
                        <div class="chat-img" id="chater1">
                            <img src="https://www.w3schools.com/howto/img_avatar.png" alt="Avatar" class="img-pic">
                            <p>amdouuyah</p>
                            </div>
                    </div>
                </div>
                <div id="main_part">
                    <div id="user_area">

                    </div>
                    <div id="chat_area">

                    </div>
                    <div id="input_area">
                        <input type="text"  id="message" placeholder="Type a message..." />
                        <button id="send" type="submit">send</button>

                    </div>
                </div>
            </div>
        </div>`;

// {/* <div id="chat-container">
//             <div id="message-display">
//             <!-- Messages will appear here -->
//             </div>
//             <div id="chat-input">
//                 <input type="text"  id="message" placeholder="Type a message..." />
//                 <button id="send" type="submit">send</button>
//             </div>
//         </div> */}
        // document.getElementById('send').addEventListener('click', async function(e) {
        //     e.preventDefault();
            // console.log(e);
            // const message = document.getElementById('message').value;
            // console.log(message);
            
            // if (message.trim() !== "") {
            //     // Send the message through the WebSocket
            //     socket.send(JSON.stringify({
            //         'msg': message,
            //         'snd_id': currentUserId,
            //         'rec_id': receiverId,
            //     }));
            //     document.getElementById('message').value = '';
            // }
        
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
            console.log(data.id);
        }
        const currentUserId = 27;
        const currentUserName = 'username';
        const receiverId = 27;
        const receiverName = 'username';

        const roomName = 'gamechata';

        // console.log(currentUserId+ ' '+ currentUserName);
        const socket = new WebSocket('ws://localhost:81/ws/chat/' + roomName + '/');
        socket.onopen = function(e) {
            console.log('Connected to WebSocket');
        }
        socket.onclose = function(e) {
            console.error('Chat socket closed unexpectedly');
        }
        socket.onmessage =function(event){
            const data = JSON.parse(event.data);
            console.log(data);
            console.log("test---------------");
            console.log(data.rec_id);
            console.log(data.snd_id);
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
        document.getElementById('send').addEventListener('click', function() {
            const message = document.getElementById('message').value;
            console.log(message);
            
            if (message.trim() !== "") {
                socket.send(JSON.stringify({
                    'msg': message,
                    'snd_id': currentUserId,
                    'rec_id': receiverId,
                }));
                document.getElementById('message').value = '';
            }
        });
        function displaymessage(message, from){
          const messageDisplay = document.getElementById('message-display');
            const newMessage = document.createElement('p');

            if (from === 'self') {
                newMessage.textContent = `You: ${message}`;
                newMessage.style.textAlign = 'right';  // Align sender messages to the right
            } else {
                newMessage.textContent = `Other: ${message}`;
                newMessage.style.textAlign = 'left';  // Align receiver messages to the left
            }

            messageDisplay.appendChild(newMessage);
            messageDisplay.scrollTop = messageDisplay.scrollHeight;
        }
        
    // });
    
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
}

        

        // Define receiverId and receiverName based on your application logic
}

customElements.define('messenger-component', MessengerComponent);