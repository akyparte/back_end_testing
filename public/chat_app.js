// import '/chat_app1.js';
(async function () {

    let socket = io();
    
    let btn = document.getElementById('send-mess-btn');
    let no_chat_popup = document.getElementById('no-chat-show');
    let friend_chat_box_profile = document.getElementById('friend_chat_box_profile');
    let message_send_box = document.getElementById('message-send-box');
    let selected_friend_name = document.getElementById('selected-friend-name');
    let selected_friend_status = document.getElementById('selected-friend-status');
    let peopleList = document.getElementById('friends');

    
    socket.on('message',(e) => {
     alert(e.message);
    })
    // btn.addEventListener('click',() => {
    //     let message = prompt('type');
    
    //     let user = message.split(' ')[0];
    
    //     socket.emit('message',{
    //         username:user,
    //         message:message
    //     });
    // })

    socket.on('update_friend_status',(friendName) => {
         
    });
    let friends = await fetch('/chat/get_friends',{
        method:'get',
    })

    friends = await friends.json();

    if(friends.response === 'RECEIVED'){ 
        let list = '';
        for(let i = 0;i < friends.data.length;i++){
            let status;
            let active = 'offline';
            if(friends.data[i].status === 'online'){
                status = 'online';
                active = 'online';
            }else if(status !== 'new User'){
                status = timeSince(new Date(friends.data[i].status)); 
            }

             list = list+`<li class="clearfix">
                              <img src=${friends.data[i].profileUrl} alt="avatar">
                              <div class="about">
                                 <div class="name">${friends.data[i].friendName}</div>
                                 <div class="status"> <i class="fa fa-circle ${active}"></i> ${status} </div>                                            
                              </div>
                          </li>`;
        }
    
        peopleList.innerHTML = list;
    }else if(friends.response === 'NOTRECEIVED'){
        // alert('server error');
        // because user is new and dont have any friends
    }

    peopleList.addEventListener('click',async (e) => {
      let friendName;
      let src;
      let status;
      // if(e.target.c)
      if(e.target.className === 'name'){
          friendName = e.target.innerText;
          status = e.target.parentNode.children[1].innerText;
          src = e.target.parentNode.parentNode.children[0].src;
      }else if(e.target.className === 'status'){
        friendName = e.target.parentNode.children[0].innerText;
        status = e.target.innerText;
        src = e.target.parentNode.parentNode.children[0].src;
      }else if(e.target.nodeName === 'IMG'){
        friendName = e.target.parentNode.children[1].children[0].innerText;
        src = e.target.src;
        status = e.target.parentNode.children[1].children[1].innerText;
      }else if(e.target.children[1].className === 'about'){
        friendName = e.target.children[1].children[0].innerText;
        src = e.target.children[0].src;
        status = e.target.children[1].innerText;
      }

      console.log(status)
       selected_friend_name.innerText = friendName;
       selected_friend_status.innerText = `Last seen: ${status}`;
       friend_chat_box_profile.children[0].children[0].src = src;

       let result = await fetch('/chat/get_chats',{
           method:'post',
           headers:{
              'Content-Type':'application/json'
           },
           body:JSON.stringify({friendName:friendName})
       })

       result = await result.json();

       if(result.response === 'CHATS'){

       }

       friend_chat_box_profile.style.visibility = 'visible';
       message_send_box.style.visibility = 'visible';
       no_chat_popup.style.display = 'none';
        
    });


    function timeSince(date) {

        var seconds = Math.floor((new Date() - date) / 1000);
      
        var interval = seconds / 31536000;
      
        if (interval > 1) {
          return Math.floor(interval) + " years ago";
        }
        interval = seconds / 2592000;
        if (interval > 1) {
          return Math.floor(interval) + " months ago";
        }
        interval = seconds / 86400;
        if (interval > 1) {
          return Math.floor(interval) + " days ago";
        }
        interval = seconds / 3600;
        if (interval > 1) {
          return Math.floor(interval) + " hours ago";
        }
        interval = seconds / 60;
        if (interval > 1) {
          return Math.floor(interval) + " minutes ago";
        }
        return Math.floor(seconds) + " seconds ago";
      }



})();