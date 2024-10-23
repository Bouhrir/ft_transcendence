import { checkJwt, displayMsg, getAccessTokenFromCookies, getuser } from './help.js';
class MessengerComponent extends HTMLElement {
    constructor() {
        super();
        this.data = null;
        this.currentUserId = null;
        this.receiverId = null;
        this.receiverName = null;
        this.roomData = null;
        this.socket = null;
    }


    async connectedCallback() {
        this.innerHTML = `
        <div id="chat-container">
            <div class="chat">
                <div id="left_side">
                    <h1>Friends</h1>
                    <div id="archive"></div>
                </div>
                <div id="main_part">
                    <div id="chat_header">
                    </div>
                    <div id="chat_area">
                    </div>
                    <form id="chat">
                        <div id="input_area">
                            <input type="text"  id="message" placeholder="Type a message..." />
                            <button id="send" type="submit">send</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>`;

        const access = getAccessTokenFromCookies('access');
        // let data;
        const response = await fetch('https://localhost:81/auth/me/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            this.data = await response.json();;
            this.currentUserId = this.data.id;
        }
        await this.fetchFriendsData()
        document.getElementById('chat').addEventListener('click', () => this.sendMessage()); 

    }


    async clickRoom() {
        const access = getAccessTokenFromCookies('access');
        const room = await fetch('https://localhost:81/chat/room/', {
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
        if (room.ok) {
            this.roomData = await room.json();

            if (this.roomData.bol) {
                const messageDisplay = document.getElementById('chat_area');
                const messages = this.roomData.messages;
                for (let i = 0; i < messages.length; i++) {
                    const message = messages[i];
                    const newMessage = document.createElement('div')

                    if (message.sender == this.currentUserId) {
                        newMessage.classList.add ('right-para')
                        newMessage.textContent = ` ${message.content}`
                    }
                    else {
                        newMessage.textContent = `${message.content}`
                        newMessage.classList.add ('left-para')
                    }
                    messageDisplay.appendChild(newMessage)
                    messageDisplay.scrollTop = messageDisplay.scrollHeight;
                }
                this.intialws();
            }
            else{
                this.intialws();
            }
        }
        else{
            console.log("Error fetching room");
        }
    }
    
    intialws(){
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.close();
        }
        this.socket = new WebSocket('wss://localhost:81/ws/chat/' + this.roomData.room_id + '/');
        this.socket.onopen = () => {
            console.log('Connected to WebSocket');
        }
        this.socket.onclose =  () => {
            console.log('Chat socket closed');
        }
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            const messageDisplay = document.getElementById('chat_area');
            const newMessage = document.createElement('div');
            newMessage.className = 'message-display';

            if (data.snd_id === this.currentUserId) {
                newMessage.classList.add ('right-para')
                newMessage.textContent = `${data.msg}`;
            }
            else{
                newMessage.classList.add ('left-para')
                newMessage.textContent = `${data.msg}`;
            }
            messageDisplay.appendChild(newMessage);
            messageDisplay.scrollTop = messageDisplay.scrollHeight;
        }
    } 

    sendMessage() {
        const message = document.getElementById('message').value;
        console.log(message)

        if (message.trim() !== "") {
            this.socket.send(JSON.stringify({
                'msg': message,
                'snd_id': this.currentUserId,
                'rec_id': this.receiverId,
                'room_id': this.roomData.room_id,
            }));
            document.getElementById('message').value = '';
        }
    }
    
    async fetchFriendsData() {
        const access = getAccessTokenFromCookies('access');
        const response = await fetch('https://localhost:81/auth/get_friends_list/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            const data = await response.json()
            const archive = document.getElementById('archive');

            document.getElementById('chat_area').innerHTML = '';


            data.forEach(e => {
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

                chater.addEventListener('click', () => {
                    console.log("clicked on room")
                    document.getElementById('chat_area').innerHTML = '';
                    this.receiverId = e.id;
                    this.receiverName = e.username;
                    const chatHeader = document.getElementById('chat_header');
                    chatHeader.style.borderBottom = '0.5px solid rgb(255, 255, 255)';
                    chatHeader.style.borderBottomLeftRadius = '20px';
                    chatHeader.style.borderBottomRightRadius = '20px';
                    chatHeader.innerHTML = '';
                    const header = document.createElement('div');
                    header.className = 'chat-img1';
                    const img = document.createElement('img');
                    img.className = 'img-pic';
                    getuser(this.receiverId, img);
                    img.width = 70;
                    img.height = 70;
                    const p = document.createElement('h5');
                    p.textContent = e.username;
                    header.appendChild(img);
                    header.appendChild(p);
                    chatHeader.appendChild(header);

                    img.addEventListener('click', () => {
                        window.location.hash = `#profile/${e.id}`
                    });
                    this.clickRoom();
            });
        });

        }
        else {
            console.log('no such friends')
        }

    }

}



// Define receiverId and receiverName based on your application logic
// }

customElements.define('messenger-component', MessengerComponent);