const createNotificationForm = document.getElementById('notificationForm')
const subscribeButton = document.getElementById('subscribeButton')
const sendNotificationButton = document.getElementById('send-notification-button')
const refreshNotificationsButton = document.getElementById('refresh-notifications-button')
const notificationsList = document.getElementById('notifications-list')

// Functions to call on window load
updateNotificationsList()

// Common Functions
function getBaseUrl() {
    return 'http://localhost:8000'
}

function logError(error) {
    console.error('Error: ', error)
}

function makeHttpRequest(method, url, headers, body) {
    return fetch(url, {
        method: method,
        body: body,
        headers: headers,
    }).then((response) => {
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
subscribeButton.addEventListener('click', function(event) {
    event.preventDefault()
    let result = requestNotificationPermission()
    console.log(result)
});

createNotificationForm.addEventListener('submit', function(event) {
    event.preventDefault()
    let result = saveNotification(createNotificationForm)
    console.log(result)
});

sendNotificationButton.addEventListener('click', function(event) {
    event.preventDefault()
    let selected_notification_id = notificationsList.options[notificationsList.selectedIndex].id;
    let result = triggerSendingPushNotification(selected_notification_id)
    console.log(result)
});

refreshNotificationsButton.addEventListener('click', function(event) {
    event.preventDefault()
    updateNotificationsList()
})


// Core Functions
function saveNotification(notificationForm){
    const formInputs = notificationForm.elements
    let url = getBaseUrl() + '/api/notifications'
    let body = JSON.stringify({
        title: formInputs['title'].value,
        description: formInputs['description'].value,
    })
    let headers = {
        'Content-type': 'application/json; charset=UTF-8',
    }
    return makeHttpRequest('POST', url, headers, body)
    .then((responseJson) => {
        notificationForm.reset()
        return responseJson
    }).catch(error => console.error('Error: ', error))
}

function is_push_notification_supported() {
    return 'serviceWorker' in navigator && 'PushManager' in window
}

function registerServiceWorker() {
    return new Promise(function (resolve, reject) {
        if (is_push_notification_supported()) {
            return navigator.serviceWorker.register('./static/js/service-worker.js')
                .then((registration) => {
                    console.log('Service worker successfully registered!');
                    return resolve(registration)
                }).catch((err) => {
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
        alert("You are already subscribed!")
        return Notification.permission
    }
    Notification.requestPermission()
    .then((permissionResult) => {
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
    .then((registration) => {
        return subscribeUserToPushNotification(registration)
    }).then((pushSubscription) => {
        console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
        return savePushSubscription(pushSubscription)
    }).catch((error) => logError(error))
}

function subscribeUserToPushNotification(registration) {
    const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(getServerPublicKey()),
    };
    return registration.pushManager.subscribe(subscribeOptions);
}

function savePushSubscription(pushSubscription) {
    const subscription = pushSubscription.toJSON()
    let url = getBaseUrl() + '/api/subscriptions'
    let body = JSON.stringify({
        push_service_url:subscription["endpoint"],
        public_key:subscription["keys"]["p256dh"],
        auth_key:subscription["keys"]["auth"],
    })
    let headers = {
        'Content-type': 'application/json; charset=UTF-8',
    }
    return makeHttpRequest('POST', url, headers, body)
        .then((responseJson) => {
            return responseJson
        }).catch(error => console.error('Error: ', error))
}

function triggerSendingPushNotification(notification_id) {
    let url = getBaseUrl() + '/api/notifications/' + notification_id + "/send"
    let headers = {
        'Content-type': 'application/json; charset=UTF-8',
    }
    return makeHttpRequest('POST', url, headers)
        .then((responseJson) => {
            return responseJson
        }).catch(error => console.error('Error: ', error))
}


function updateNotificationsList() {
    notificationsList.innerHTML = ''
    fetchAllNotifications()
        .then(data => {
            data.forEach(notification => render(notification))
        });
}

function render(notification) {
    const option = document.createElement('option')
    let option_text = notification.title + " | " + notification.description
    option.id = notification.id
    const content = document.createTextNode(`${option_text}`)
    option.appendChild(content)
    notificationsList.appendChild(option)
}

function fetchAllNotifications() {
    let url = getBaseUrl() + '/api/notifications'
    let headers = {
        'Content-type': 'application/json; charset=UTF-8',
    }
    return makeHttpRequest('GET', url, headers)
        .then((responseJson) => {
            return responseJson
        }).catch(error => console.error('Error: ', error))
}
