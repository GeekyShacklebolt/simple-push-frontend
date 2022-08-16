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

function getServerPublicKey() {
    return 'BE1Os0J-cotQcRHDsGB8qjlF27SUlQxJlOySNMrNN-jGvFW4W6k7ZxmqSxUcDwayR68gwSaGTUw1N-9scTwBK1s'
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Event Listeners
subscribeButton.addEventListener('click', function(event){
    event.preventDefault();
    requestNotificationPermission()
});

notificationForm.addEventListener('submit', function(event){
    event.preventDefault();
    createNewNotification(notificationForm)
    .then(function(result) {
        console.log(result)
    }).catch((error) => logError(error));
});


// Core Functions
function createNewNotification(notificationForm){
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
                    return resolve(registration)
                }).catch(function (err) {
                    console.error('Unable to register service worker.', err);
                    return resolve(err)
                });
        } else {
            let msg = 'The browser does not support service workers or push messages.'
            console.error(msg);
            return reject(msg)
        }
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
            return executeUserSubscriptionFlow()
        } else {
            throw new Error("Notification Permission NOT granted.")
        }
    }).catch((error) => logError(error))
}

function executeUserSubscriptionFlow() {
    registerServiceWorker()
    .then(function (registration) {
        return subscribeUserToPushNotification(registration)
    }).then(function (pushSubscription) {
        console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
        console.log("TODO: Send push subscription details to Backend.")
    }).catch((error) => logError(error))
}

function subscribeUserToPushNotification(registration) {
    const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(getServerPublicKey()),
    };
    return registration.pushManager.subscribe(subscribeOptions);
}
