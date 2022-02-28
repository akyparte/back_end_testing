// import '/chat_app1.js';
(async function () {

    let socket = io();
    
    let no_chat_popup = document.getElementById('no-chat-show');
    let peopleList = document.getElementById('friends');
    let selected_friend_profile_container = document.getElementById('selected-friend-profile-container');
    let selected_friend_profile_img = document.getElementById('selected-friend-profile-img');
    let selected_friend_name = document.getElementById('selected-friend-name');
    let selected_friend_status = document.getElementById('selected-friend-status');
    let message_send_box = document.getElementById('message-send-box');

    
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
      let profileSrc;
      let status;
      let friend_continer;
        if(e.target.nodeName === 'LI' && ( e.target.className === 'clearfix' || e.target.className === 'clearfix active')){
          friendName = e.target.children[1].children[0].innerText.trim();
          profileSrc = e.target.children[0].src;
          status = e.target.children[1].children[1].innerText.trim();
          friend_continer = e.target;
       }else if(e.target.nodeName === 'IMG'){
           friendName = e.target.nextElementSibling.children[0].innerText.trim();
           profileSrc = e.target.src;
           status = e.target.nextElementSibling.children[1].innerText.trim();
           friend_continer = e.target.parentNode;
       }else if(e.target.nodeName === 'DIV' && e.target.className === 'about'){
           friendName = e.target.children[0].innerText.trim();
           status = e.target.chilldren[1].innerText.trim();
           profileSrc = e.target.previousElementSibling.src;
           friend_continer = e.target.parentNode;
       }else if(e.target.nodeName === 'DIV' && e.target.className === 'name'){
           friendName = e.target.innerText.trim();
           profileSrc = e.target.parentNode.previousElementSibling.src;
           status = e.target.nextElementSibling.innerText.trim();
           friend_continer = e.target.parentNode.parentNode;
       }else if(e.target.nodeName === 'DIV' && e.target.className === 'status'){
         console.log(e.target.previousElementSibling);
           friendName = e.target.previousElementSibling.innerText.trim();
           profileSrc = e.target.parentNode.previousElementSibling.src;
           status = e.target.innerText.trim();
           friend_continer = e.target.parentNode.parentNode;
       }

    if(selected_friend_name.innerText.trim() !== friendName){
       let friend_list = friend_continer.parentNode;
        for(let i = 0;i < friend_list.children.length;i++){
             if(friend_list.children[i].classList.contains('active')){
              friend_list.children[i].classList.remove('active');
              break;
             }
        }
       selected_friend_name.innerText = friendName;
       selected_friend_status.innerText =  `Last seen: ${status}`;
       selected_friend_profile_img.src = profileSrc;
         
       selected_friend_profile_container.style.visibility = 'visible';
       if(message_send_box.style.visibility != 'visible') message_send_box.style.visibility = 'visible';
       no_chat_popup.style.display = 'none';
       friend_continer.classList.add('active');
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
      }


       
        
    });


    function timeSince(date) {

        var seconds = Math.floor((new Date() - date) / 1000);
      
        var interval = seconds / 31536000;
      
        let finalTime;
        if (interval > 1) {
          finalTime = Math.floor(interval);
          return finalTime === 1 ? `${finalTime} year ago`:`${finalTime} years ago`;
        }
        interval = seconds / 2592000;
        if (interval > 1) {
          finalTime = Math.floor(interval);
          return finalTime === 1 ? `${finalTime} month ago`:`${finalTime} months ago`;
        }
        interval = seconds / 86400;
        if (interval > 1) {
          finalTime = Math.floor(interval);
          return finalTime === 1 ? `${finalTime} day ago`:`${finalTime} days ago`;

        }
        interval = seconds / 3600;
        if (interval > 1) {
          finalTime = Math.floor(interval);
          return finalTime === 1 ? `${finalTime} hour ago`:`${finalTime} hours ago`;
        }
        interval = seconds / 60;
        if (interval > 1) {
          finalTime = Math.floor(interval);
          return finalTime === 1 ? `${finalTime} minute ago`:`${finalTime} minutes ago`;
        }
        return interval === 1 ? `${interval} second ago`:`${interval} seconds ago`;
      }



})();