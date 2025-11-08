
document.addEventListener('DOMContentLoaded', () => {
    const usernameTextElements = document.querySelectorAll('.username-text');
    const connectBtn = document.getElementById('connectBtn');

    // Function to update all username elements on the page
    function updateUsernameElements(username) {
        usernameTextElements.forEach(el => {
            el.textContent = username || 'No username';
        });
        const usernameDisplay = document.getElementById('usernameDisplay');
        if (usernameDisplay) {
            usernameDisplay.textContent = username || 'User';
        }
    }

    // Load username from localStorage
    let currentUsername = localStorage.getItem('username');
    updateUsernameElements(currentUsername);

    // Listen for username changes from other pages
    window.addEventListener('storage', (event) => {
        if (event.key === 'username') {
            currentUsername = event.newValue;
            updateUsernameElements(currentUsername);
        }
    });

    // Handle username changes
    const usernameElements = document.querySelectorAll('.username-text');
    usernameElements.forEach(el => {
        el.addEventListener('click', () => {
            const newUsername = prompt('Enter your new username:', currentUsername || '');
            if (newUsername !== null) {
                currentUsername = newUsername.trim();
                localStorage.setItem('username', currentUsername);
                updateUsernameElements(currentUsername);
                // Dispatch a storage event to notify other tabs/windows
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'username',
                    newValue: currentUsername
                }));
            }
        });
    });

    // Handle "Connect Pad" button
    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            // This will be handled by arduino.js, which should be loaded on all pages
            console.log('Attempting to connect to pad...');
        });
    }
});
