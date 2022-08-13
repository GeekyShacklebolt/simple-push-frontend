const notificationForm = document.getElementById('notificationForm')
notificationForm.addEventListener('submit', function(event){
    event.preventDefault();
    createNotification();
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
