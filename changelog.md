### 22nd Aug, 2022

* The dropdown can be refreshed to fetch the latest list of notifications available. 
* Integrated API (`POST /api/notifications/:id/send`) to trigger a specific push notification to all subscribers.
* Show available notifications from backend on a dropdown to allow user to select which notification to send.

### 19th Aug, 2022

* Display notification on device using service-worker 

### 16th Aug, 2022

* Integrated API (`POST /api/subscriptions`) - Send push subscription data to backend to save into DB
* Subscribe the user to push notification

### 13th Aug, 2022

* Added opt-in popup - Ask user for notification permission
* Add function to register service worker file
* Integrated API (`POST /api/notifications`) - On submitting create notification form, send notification data to backend

### 12th Aug, 2022

* Initialize the main webpage (dashboard) with notification creation form
* Spawned up the repository
