self.addEventListener('push', function(event) {
    const promiseChain = self.registration.showNotification(
        title=event.data.text(),
        options={"body": "test"},
        );
    event.waitUntil(promiseChain);
});
