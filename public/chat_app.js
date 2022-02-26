let socket = io();

let btn = document.getElementById('send-mess-btn');

socket.on('message',(e) => {
 alert(e.message);
})
btn.addEventListener('click',() => {
    let message = prompt('type');

    let user = message.split(' ')[0];

    socket.emit('message',{
        username:user,
        message:message
    });
})