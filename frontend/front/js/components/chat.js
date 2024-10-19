import { checkJwt , getAccessTokenFromCookies} from './help.js';
class MessengerComponent extends HTMLElement {
   async connectedCallback(){
        this.innerHTML = `
        <div id="chat-container">
            <div class="chat">
                <div id="left_side">
                    <h1>Friends</h1>
                    <div id="archive">
                        <div class="chat-img" id="chater1">
                            <img src="https://www.w3schools.com/howto/img_avatar.png" alt="Avatar" class="img-pic">
                            <p>amdouuyah</p>
                            </div>
                    </div>
                </div>
                <div id="main_part">
                    <div id="chat_area">

                    </div>
                    <div id="input_area">
                        <input type="text"  id="message" placeholder="Type a message..." />
                        <button id="send" type="submit">send</button>

                    </div>
                </div>
            </div>
        </div>`;
        await checkJwt();
        
        const access = getAccessTokenFromCookies('access');
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
            // console.log(data.id);
        }




        const currentUserId = data.id;
        const currentUserName = 'username';
        const receiverId = 94
        const receiverName = 'username';
        const room = await fetch('http://localhost:81/chat/room/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',

        },
        body: JSON.stringify({
            'user1': currentUserId,
            'user2': receiverId,
        }),
        });
        const roomData = await room.json();
        if(!room.ok){
            console.log("error");
            return;
        }

        const roomName = roomData.room_id;
        function displaymessage(message, from){
            const messageDisplay = document.getElementById('chat_area');
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

        
        const socket = new WebSocket('ws://localhost:81/ws/chat/' + roomName + '/');
        socket.onopen = function(e) {
            console.log('Connected to WebSocket');
            console.log("room name: " + roomName);
        }
        socket.onclose = function(e) {
            console.error('Chat socket closed unexpectedly');
        }
        socket.onmessage =function(event){
            const data = JSON.parse(event.data);
            // console.log(data);
            console.log(data.rec_id);
            // console.log("test---------------");
            console.log(data.snd_id);
            // console.log(data.message);
            console.log(data.room_id);

            if (data.rec_id === receiverId && data.snd_id === currentUserId) {
                    // Display the message
                //     const messageDisplay = document.getElementById('chat_area');
                //     messageDisplay.innerHTML += `<p>${data.msg}</p>`;
                //      //const newMessage = document.createElement('p');
                //    // newMessage.textContent = data.message;
                //     //messageDisplay.appendChild(newMessage);
                const messageDisplay = document.getElementById('chat_area');
                const newMessage = document.createElement('p');
                // if (from === 'self') {
                    if (data.snd_id == currentUserId) {
                        console.log(data.snd_id);
                        console.log(data.rec_id);
                        console.log("right");
                        newMessage.textContent = `You: ${data.msg}`;
                        newMessage.className = 'right-para';
                        messageDisplay.appendChild(newMessage);
                        // messageDisplay.innerHTML += `<p style="text-align: left;">You: ${data.msg}.</p>`;
                        // messageDisplay.innerHTML += `<p class="right-para"> ${data.msg}</p>`;
                        
                        // newMessage.style.textAlign = 'right';  // Align sender messages to the right
                    }
                    else if (data.snd_id == receiverId) {
                        console.log("left");
                        newMessage.textContent = `You: ${data.msg}`;
                        newMessage.className = 'left-para';
                        messageDisplay.appendChild(newMessage);
                    }
                
                messageDisplay.scrollTop = messageDisplay.scrollHeight;
                // newMessage.textContent = `You: ${message}`;
                // newMessage.style.textAlign = 'right';  // Align sender messages to the right
                //  } else {
                    // newMessage.textContent = `Other: ${message}`;
                    // newMessage.style.textAlign = 'left';  // Align receiver messages to the left
            // }
            messageDisplay.appendChild(newMessage);
            messageDisplay.scrollTop = messageDisplay.scrollHeight;
                }
            }
        document.getElementById('send').addEventListener('click', function() {
            const message = document.getElementById('message').value;             
            if (message.trim() !== "") {
                socket.send(JSON.stringify({
                    'msg': message,
                    'snd_id': currentUserId,
                    'rec_id': receiverId,
                    'room_id' : roomName,
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

}

        

        // Define receiverId and receiverName based on your application logic
}

customElements.define('messenger-component', MessengerComponent);