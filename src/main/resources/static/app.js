let currentRecipient = '';
let authHeader = '';
let pollInterval = null;
let usersPollInterval = null;

function showAuthError(message) {
    document.getElementById('auth-error').innerText = message;
}

function showChatError(message) {
    document.getElementById('chat-error').innerText = message;
}

async function responseError(response) {
    const body = await response.text();
    if (!body) return `Request failed (${response.status}).`;
    try {
        const error = JSON.parse(body);
        if (Array.isArray(error.errors) && error.errors.length > 0) {
            return error.errors.map(item => item.defaultMessage || item.message).filter(Boolean).join(' ');
        }
        return error.detail || error.message || error.title || body;
    } catch {
        return body;
    }
}

function encodeBasicCredentials(username, password) {
    const bytes = new TextEncoder().encode(`${username}:${password}`);
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return `Basic ${btoa(binary)}`;
}

async function register() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value;
    showAuthError('');
    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p })
        });
        if (res.ok) {
            showAuthError('Registration successful. Please log in.');
        } else {
            showAuthError(await responseError(res));
        }
    } catch {
        showAuthError('Could not connect to the server. Please try again.');
    }
}

async function login() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value;
    showAuthError('');
    try {
        const credentials = encodeBasicCredentials(u, p);
        const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': credentials }
        });

        if (res.ok) {
            authHeader = credentials;
            document.getElementById('auth-container').classList.add('hidden');
            document.getElementById('chat-container').classList.remove('hidden');
            document.getElementById('current-user').innerText = u;
            await loadUsers();
            if (usersPollInterval) clearInterval(usersPollInterval);
            usersPollInterval = setInterval(loadUsers, 5000);
        } else {
            showAuthError('Invalid username or password.');
        }
    } catch {
        showAuthError('Could not connect to the server. Please try again.');
    }
}

async function loadUsers() {
    try {
        const res = await fetch('/api/chat/users', { headers: { 'Authorization': authHeader } });
        if (!res.ok) throw new Error(await responseError(res));
        const users = await res.json();
        const list = document.getElementById('users-list');
        list.innerHTML = '';
        users.forEach(user => {
            const li = document.createElement('li');
            li.innerText = user;
            if (user === currentRecipient) li.classList.add('active');
            li.onclick = () => selectUser(user, li);
            list.appendChild(li);
        });
        showChatError('');
    } catch (error) {
        showChatError(error.message || 'Could not load contacts.');
    }
}

function selectUser(username, element) {
    currentRecipient = username;
    showChatError('');
    document.querySelectorAll('#users-list li').forEach(li => li.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('chat-target').innerText = `Chatting with: ${username}`;
    document.getElementById('input-box').classList.remove('hidden');
    
    loadChatHistory();
    if(pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(loadChatHistory, 2000);
}

async function loadChatHistory() {
    if(!currentRecipient) return;
    try {
        const res = await fetch(`/api/chat/history/${encodeURIComponent(currentRecipient)}`, { headers: { 'Authorization': authHeader } });
        if (!res.ok) throw new Error(await responseError(res));
        const messages = await res.json();
        const box = document.getElementById('messages-box');
        const wasAtBottom = box.scrollHeight - box.clientHeight <= box.scrollTop + 20;

        box.innerHTML = '';
        messages.forEach(msg => {
            const div = document.createElement('div');
            div.classList.add('msg', msg.sender === currentRecipient ? 'received' : 'sent');
            div.innerText = msg.content;
            box.appendChild(div);
        });

        if (wasAtBottom) box.scrollTop = box.scrollHeight;
        showChatError('');
    } catch (error) {
        showChatError(error.message || 'Could not load chat history.');
    }
}

async function sendMessage() {
    const input = document.getElementById('message-text');
    const content = input.value.trim();
    if(!content || !currentRecipient) return;

    try {
        const res = await fetch('/api/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
            body: JSON.stringify({ recipient: currentRecipient, content: content })
        });
        if (!res.ok) throw new Error(await responseError(res));
        input.value = '';
        showChatError('');
        await loadChatHistory();
    } catch (error) {
        showChatError(error.message || 'Could not send message.');
    }
}

function logout() {
    authHeader = '';
    currentRecipient = '';
    if(pollInterval) clearInterval(pollInterval);
    if(usersPollInterval) clearInterval(usersPollInterval);
    pollInterval = null;
    usersPollInterval = null;
    document.getElementById('users-list').innerHTML = '';
    document.getElementById('messages-box').innerHTML = '';
    document.getElementById('input-box').classList.add('hidden');
    document.getElementById('chat-target').innerText = 'Select a contact to begin';
    showChatError('');
    document.getElementById('chat-container').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
    showAuthError('');
}
