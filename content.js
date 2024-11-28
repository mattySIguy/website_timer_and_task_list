// content.js
// Inject overlay for notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.innerText = message;
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.right = '10px';
    notification.style.backgroundColor = 'yellow';
    document.body.appendChild(notification);
}

// Example usage
showNotification("You have 10 minutes left!");
