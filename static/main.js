registerServiceWorker()

const notificationForm = document.getElementById('notificationForm')
const subscribeButton = document.getElementById('subscribeButton')

notificationForm.addEventListener('submit', function(event){
    event.preventDefault();
    createNotification();
});

subscribeButton.addEventListener('click', function(event){
    event.preventDefault();
    requestNotificationPermission();
});

function createNotification(){
    const form = notificationForm
    let title = document.getElementById('title').value
    let description = document.getElementById('description').value

    fetch('http://localhost:8000/notifications', {
        method: 'POST',
        body: JSON.stringify({
            title:title,
            description:description,
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        }
    })
    .then(function(response){
        return response.json()})
    .then(function(data){
        console.log(data)
        form.reset()
    }).catch(error => console.error('Error:', error));
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        return navigator.serviceWorker
            .register('./static/service-worker.js')
            .then(function (registration) {
                console.log('Service worker successfully registered!');
                return registration;
            })
            .catch(function (err) {
                console.error('Unable to register service worker.', err);
            });
    } else {
        console.error('The browser does not support service workers or push messages.');
    }
}

function requestNotificationPermission() {
    return new Promise(function (resolve, reject) {
        const permissionResult = Notification.requestPermission(function (result) {
            resolve(result);
        });
        if (permissionResult) {
            permissionResult.then(resolve, reject);
        }
    }).then(function (permissionResult) {
        if (permissionResult !== 'granted') {
            throw new Error("We weren't granted permission.");
        }
    });
}
