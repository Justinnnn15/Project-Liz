// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, orderBy, query, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzU0zjAT8PIMiSYoS-93RmEbAls2e1Wqk",
    authDomain: "kim-jiwon.firebaseapp.com",
    projectId: "kim-jiwon",
    storageBucket: "kim-jiwon.firebasestorage.app",
    messagingSenderId: "756967712646",
    appId: "1:756967712646:web:1199f25bf30933a1f36e07",
    measurementId: "G-19CELYKP6Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// References
const messagesCollection = collection(db, 'lizMessages');
const modal = document.getElementById('messageModal');
const addMessageCard = document.getElementById('addMessageCard');
const closeBtn = document.querySelector('.close');
const submitBtn = document.getElementById('submitBtn');
const nicknameInput = document.getElementById('nicknameInput');
const messageInput = document.getElementById('messageInput');
const messagesContainer = document.getElementById('messagesContainer');

// Color options for cards
const colors = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6'];

// Open modal when clicking add button
addMessageCard.addEventListener('click', () => {
    modal.style.display = 'block';
    nicknameInput.focus();
});

// Close modal
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    clearInputs();
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        clearInputs();
    }
});

// Submit message
submitBtn.addEventListener('click', async () => {
    const nickname = nicknameInput.value.trim();
    const message = messageInput.value.trim();

    if (!nickname || !message) {
        alert('Please fill in both nickname and message!');
        return;
    }

    try {
        await addDoc(messagesCollection, {
            nickname: nickname,
            message: message,
            timestamp: serverTimestamp()
        });

        // Success feedback
        submitBtn.textContent = 'Posted! ✓';
        submitBtn.style.background = 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
        
        setTimeout(() => {
            modal.style.display = 'none';
            clearInputs();
            submitBtn.textContent = 'Post Message';
            submitBtn.style.background = 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)';
        }, 1500);
    } catch (error) {
        console.error('Error adding message:', error);
        alert('Error posting message. Please try again!');
    }
});

// Clear inputs
function clearInputs() {
    nicknameInput.value = '';
    messageInput.value = '';
}

// Listen for real-time updates
const q = query(messagesCollection, orderBy('timestamp', 'desc'));
onSnapshot(q, (snapshot) => {
    // Clear existing messages (except the add button)
    const existingMessages = messagesContainer.querySelectorAll('.message-card');
    existingMessages.forEach(card => card.remove());
    
    // Add messages before the add button
    snapshot.forEach((docSnapshot, index) => {
        const messageData = docSnapshot.data();
        const messageElement = createMessageCard(docSnapshot.id, messageData, index);
        messagesContainer.insertBefore(messageElement, addMessageCard);
    });
});

// Create message card element
function createMessageCard(id, data, index) {
    const card = document.createElement('div');
    card.className = `message-card ${colors[index % colors.length]}`;
    
    // Random rotation for natural look
    const randomRotation = (Math.random() - 0.5) * 4;
    card.style.transform = `rotate(${randomRotation}deg)`;
    
    // Format timestamp
    const timestamp = data.timestamp ? data.timestamp.toDate() : new Date();
    const formattedDate = timestamp.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    card.innerHTML = `
        <button class="delete-btn" data-id="${id}">×</button>
        <div class="message-nickname">${escapeHtml(data.nickname)}</div>
        <div class="message-text">${escapeHtml(data.message)}</div>
        <div class="message-date">${formattedDate}</div>
    `;
    
    // Add delete functionality
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Delete this message?')) {
            try {
                await deleteDoc(doc(db, 'lizMessages', id));
            } catch (error) {
                console.error('Error deleting message:', error);
                alert('Error deleting message. Please try again!');
            }
        }
    });
    
    return card;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Allow Enter key to submit (Shift+Enter for new line in textarea)
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitBtn.click();
    }
});

nicknameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        messageInput.focus();
    }
});
