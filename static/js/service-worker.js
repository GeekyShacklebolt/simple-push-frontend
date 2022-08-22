
// Event Listeners
self.addEventListener('push', function(event) {
    const notification_data = event.data.json()
    const options = parseOptionsFromNotificationData(notification_data)
    const promiseChain = self.registration.showNotification(
        notification_data["title"],
        options,
        );
    event.waitUntil(promiseChain);
});

// Utilities
function parseOptionsFromNotificationData(notificationData) {
    return {
        "body": notificationData["description"]
    };
}
