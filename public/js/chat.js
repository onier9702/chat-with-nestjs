

const username = localStorage.getItem('name');

if (!username) {
    window.location.replace('/');
    throw new Error('Username is required to get into the chat');
}

// References to HTML
const online = document.querySelector('#status-online');
const offline = document.querySelector('#status-offline');
const ulUsers = document.querySelector('ul');

const form = document.querySelector('form');
const input = document.querySelector('input');
const chatElement = document.querySelector('#chat');

const renderUsersInHTML = (users) => {
    ulUsers.innerHTML = '';
    users.forEach(user => {
        const liElem = document.createElement('li');
        liElem.innerText = user.name;
        ulUsers.appendChild(liElem);
    });
}

const renderMessage = (payload) => {
    const { userId, message, name } = payload;

    const divElement = document.createElement('div');
    divElement.classList.add('message');

    if (userId !== socket.id) {
        divElement.classList.add('incoming');
    }

    divElement.innerHTML = `
        <small>${name}</small>
        <p>${message}</p>
    `;
    chatElement.appendChild(divElement);

    // scroll to end of messages
    chatElement.scrollTop = chatElement.scrollHeight;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = input.value;
    input.value = '';

    socket.emit('chat-message', message);
});


// this is thanks to the import in chat.html => <script src="socket.io/socket.io.min.js"></script>
const socket = io({  // Connection to our server from frontend
    auth: {
        token: 'ABC-123', // use the token (JWT) of the user authenticated
        username: username,
    }
});

// to know in frontend when is connected and not
socket.on('connect', () => {
    console.log('Connected');
    online.classList.remove('hidden');
    offline.classList.add('hidden');
});

socket.on('disconnect', () => {
    console.log('Disconnected');
    online.classList.add('hidden');
    offline.classList.remove('hidden');
});

// Listen to custom events
socket.on('welcome-message', (payload) => {
    console.log(payload);
});

socket.on('on-clients-changed', (payload) => {
    console.log('List of clients: ', payload);
    renderUsersInHTML(payload);
})

socket.on('on-message', (message) => {
    console.log(message);
    renderMessage(message);
});
