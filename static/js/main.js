const notificationForm = document.getElementById('notificationForm')
const subscribeButton = document.getElementById('subscribeButton')

// Common Functions
function getBaseUrl() {
    return 'http://localhost:8000'
}

function logError(error) {
    console.error('Error: ', error)
}

function makeHttpRequest(method, url, body, headers) {
    return fetch(url, {
        method: method,
        body: body,
        headers: headers,
    }).then(function(response){
        return response.json()
    }).catch((error) => logError(error));
}


// Event Listeners
subscribeButton.addEventListener('click', function(event){
    event.preventDefault();
    requestNotificationPermission()
});

notificationForm.addEventListener('submit', function(event){
    event.preventDefault();
    createNotification(notificationForm)
    .then(function(result) {
        console.log(result)
    }).catch((error) => logError(error));
});


// Core Functions
function createNotification(notificationForm){
    const formInputs = notificationForm.elements
    let url = getBaseUrl() + '/notifications'
    let body = JSON.stringify({
        title: formInputs['title'].value,
        description: formInputs['description'].value,
    })
    let headers = {
        'Content-type': 'application/json; charset=UTF-8',
    }
    return makeHttpRequest('POST', url, body, headers)
    .then(function (responseJson) {
        notificationForm.reset()
        return responseJson
    }).catch(error => console.error('Error: ', error))
}

function registerServiceWorker() {
    return new Promise(function (resolve, reject) {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.register('./static/js/service-worker.js')
                .then(function (registration) {
                    console.log('Service worker successfully registered!');
                    return registration;
                }).catch(function (err) {
                    console.error('Unable to register service worker.', err);
                });
        } else {
            console.error('The browser does not support service workers or push messages.');
        }
        throw new Error("Service worker registration failed!")
    })
}

function requestNotificationPermission() {
    if (Notification.permission === 'granted') {
        return Notification.permission
    }
    Notification.requestPermission()
    .then(function (permissionResult) {
        if (permissionResult === 'granted') {
            console.log("Notification Permission granted!")
            console.log("TODO: subscribe user to push notification!")
        } else {
            throw new Error("Notification Permission NOT granted.")
        }
    }).catch((error) => logError(error))
}
