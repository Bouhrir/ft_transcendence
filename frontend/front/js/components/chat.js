import { checkJwt , displayMsg, getAccessTokenFromCookies, getuser} from './help.js';
class MessengerComponent extends HTMLElement {
    constructor(){
        super();
        let data = null;
        let receiverId
        let currentUserId 
        let roomData
    }
   async connectedCallback(){
        this.innerHTML = `
        <div id="chat-container">
            <div class="chat">
                <div id="left_side">
                    <h1>Friends</h1>
                    <div id="archive"></div>
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

        const access = getAccessTokenFromCookies('access');
        // let data;
        const response = await fetch('http://localhost:81/auth/me/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access}`,
                    'Content-Type': 'application/json',
                },
            });
        if (response.ok){
            this.data = await response.json();;
            // console.log(data.id);
        }
        this.currentUserId = this.data.id;
        this.fetchFriendsData()
        if (!this.receiverId){
            document.getElementById('chat_area').innerHTML = `<p>Click on a friend to start chatting</p>`;
            return;
        }
        this.clickRoom()
        const roomName = this.roomData.room_id;
        console.log(roomName);
        
        // function displayoldmessage(this.roomData){
        //     const messageDisplay = document.getElementById('chat_area');
        //     const messages = this.roomData.messages;
        //     for(let i = 0; i < messages.lenght; i++){
        //         const message = messages[i];
        //         if (message.sender == currentUserId){
        //             const newMessage = document.createElement('p')
        //             newMessage.textContent = `You: ${message.content}`
        //             newMessage.className = 'right-para'
        //             messageDisplay.appendChild(newMessage)
        //         }
        //         else{
        //             const newMessage = document.createElement('p')
        //             newMessage.textContent = `You: ${message.content}`
        //             newMessage.className = 'left-para'
        //             messageDisplay.appendChild(newMessage)
        //         }
        //         messageDisplay.scrollTop = messageDisplay.scrollHeight;
        //     }
        // }
        // displayoldmessage(this.roomData);

        
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

            if (data.rec_id === this.receiverId && data.snd_id === this.currentUserId) {
                    // Display the message
                //     const messageDisplay = document.getElementById('chat_area');
                //     messageDisplay.innerHTML += `<p>${data.msg}</p>`;
                //      //const newMessage = document.createElement('p');
                //    // newMessage.textContent = data.message;
                //     //messageDisplay.appendChild(newMessage);
                const messageDisplay = document.getElementById('chat_area');
                const newMessage = document.createElement('p');
                // if (from === 'self') {
                    if (data.snd_id == this.currentUserId) {
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
                    else if (data.rec_id == this.receiverId) {
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
            // messageDisplay.appendChild(newMessage);
            // messageDisplay.scrollTop = messageDisplay.scrollHeight;
                }
            }
        document.getElementById('send').addEventListener('click', function() {
            const message = document.getElementById('message').value;             
            if (message.trim() !== "") {
                socket.send(JSON.stringify({
                    'msg': message,
                    'snd_id': this.currentUserId,
                    'rec_id': this.receiverId,
                    'room_id' : roomName,
                }));
                document.getElementById('message').value = '';
            }
        });
        // function displaymessage(message, from){
        //   const messageDisplay = document.getElementById('message-display');
        //     const newMessage = document.createElement('p');

        //     if (from === 'self') {
        //         newMessage.textContent = `You: ${message}`;
        //         newMessage.style.textAlign = 'right';  // Align sender messages to the right
        //     } else {
        //         newMessage.textContent = `Other: ${message}`;
        //         newMessage.style.textAlign = 'left';  // Align receiver messages to the left
        //     }

            // messageDisplay.appendChild(newMessage);
            // messageDisplay.scrollTop = messageDisplay.scrollHeight;
        }
        
    // });
    async clickRoom(){
        console.log(this.currentUserId, this.receiverId);
        const access = getAccessTokenFromCookies('access');
        const room = await fetch('http://localhost:81/chat/room/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',

        },
        body: JSON.stringify({
            'user1': this.currentUserId,
            'user2': this.receiverId,
        }),
        });
        this.roomData = await room.json();
        console.log(this.roomData.room_id);
        if(!room.ok){
            console.log("error");
            return;
        }
    }
    async fetchFriendsData(){
        const access = getAccessTokenFromCookies('access');
        const response = await fetch('http://localhost:81/auth/get_friends_list/', {
            method: 'GET',
            headers:{
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
            },
        });
        if (response.ok){
            const data = await response.json()

            data.forEach(e => {
                const archive = document.getElementById('archive');
                const chater = document.createElement('div');
                chater.className = 'chat-img';

                const img = document.createElement('img');
                img.className = 'img-pic';
                getuser(e.id, img);
                img.width = 70;
                img.height = 70;
                chater.appendChild(img);


                const p = document.createElement('p');
                p.textContent = e.username;
                chater.appendChild(p);


                archive.appendChild(chater);

                document.getElementById('archive').addEventListener('click', function() {
                document.getElementById('chat_area').innerHTML = '';
                    console.log("clicked");
                    console.log(e.id);
                    console.log(e.username);
                    this.receiverId = e.id;
                    // receiverName = e.username;
                    console.log(this.receiverId);
                    // console.log(receiverName);
                })


            });

        }
        else
        {
            console.log('no such friends')
        }
      
    }

}

        

        // Define receiverId and receiverName based on your application logic
// }

customElements.define('messenger-component', MessengerComponent);