// import { json } from 'express/lib/response';
// import '/chat_app1.js';
(async function () {
    let currentChatRequestId = 0;
    let chatHistoryRequestId = 'None';
    let isChatDataAvailableForCurrentUser = true;
    let socket = io();
    let chatIdObj = {};
    let selectedFriendName;
    let selectedFriendIndex;
    let no_chat_popup = document.getElementById('no-chat-show');
    let peopleList = document.getElementById('friends');
    let selected_friend_profile_container = document.getElementById('selected-friend-profile-container');
    let selected_friend_profile_img = document.getElementById('selected-friend-profile-img');
    let selected_friend_name = document.getElementById('selected-friend-name');
    let selected_friend_status = document.getElementById('selected-friend-status');
    let message_send_box = document.getElementById('message-send-box');
    let add_friend_btn = document.getElementById('add-friend-btn');
    let popup_frame = document.getElementById('popup-frame');
    let popup = document.querySelector('.card.mycard.mt-5.p-4');
    let no_friends_popup = document.getElementById('no-friends');
    let search_user_box = document.getElementById('search_user_box');
    let search_input = document.getElementById('search_user_input');
    let send_mess_input_field = document.getElementById('send-mess-input-field');
    let message_container = document.getElementById('message-container');
    let search_status_bar = document.getElementById('search_status_bar');
    let loading_box = document.getElementById('loading-box');
    let search_user_btn = document.getElementById('search_user_btn');
    let filter_friends_search = document.getElementById('filter-friends-search');
 
    //calling function to initialize friends
    // iitializeFriends();

    peopleList.addEventListener('click',async (e) => {
      isChatDataAvailableForCurrentUser = true;
      // removeAllChildren(message_container);
      let friendName;
      let profileUrl;
      let status;
      let friend_continer;
        if(e.target.nodeName === 'LI' && e.target.classList.contains('clearfix')){
          friendName = e.target.children[1].children[0].innerText.trim();
      // console.log(e.target);

          profileUrl = e.target.children[0].src;
          status = e.target.children[1].children[1].innerText.trim();
          friend_continer = e.target;
      //  console.log(friend_continer);
      removeAllChildren(message_container);
       }else if(e.target.nodeName === 'IMG'){
           friendName = e.target.nextElementSibling.children[0].innerText.trim();
           profileUrl = e.target.src;
           status = e.target.nextElementSibling.children[1].innerText.trim();
           friend_continer = e.target.parentNode;
           removeAllChildren(message_container);
       }else if(e.target.nodeName === 'DIV' && e.target.className === 'about'){
           friendName = e.target.children[0].innerText.trim();
           status = e.target.chilldren[1].innerText.trim();
           profileUrl = e.target.previousElementSibling.src;
           friend_continer = e.target.parentNode;
           removeAllChildren(message_container);
       }else if(e.target.nodeName === 'DIV' && e.target.className === 'name'){
           friendName = e.target.innerText.trim();
           profileUrl = e.target.parentNode.previousElementSibling.src;
           status = e.target.nextElementSibling.innerText.trim();
           friend_continer = e.target.parentNode.parentNode;
           removeAllChildren(message_container);
       }else if(e.target.nodeName === 'DIV' && e.target.className === 'status'){
         console.log(e.target.previousElementSibling);
           friendName = e.target.previousElementSibling.innerText.trim();
           profileUrl = e.target.parentNode.previousElementSibling.src;
           status = e.target.innerText.trim();
           friend_continer = e.target.parentNode.parentNode;
           removeAllChildren(message_container);
       }

      //  console.log(friend_continer);
      if(selected_friend_name.innerText.trim() !== friendName){


       let friend_list = friend_continer.parentNode;
        for(let i = 0;i < friend_list.children.length;i++){
             if(friend_list.children[i].classList.contains('active')){
              friend_list.children[i].classList.remove('active');
              break;
             }
        }
       selectedFriendName = friendName;
       for(let i = 0;i < peopleList.children.length;i++){
           if(peopleList.children[i] === friend_continer){
               selectedFriendIndex = i;
               break;
           }
       }

       // fisrt sending friend which is getting selected
       // second the friend will be unselected
       socket.emit('update-users-friends',{activeFriend:friendName,inActiveFriend:selected_friend_name.innerText.trim()});
       selected_friend_name.innerText = friendName;

       if(status === 'online') selected_friend_status.innerText =  `online`;
       else selected_friend_status.innerText =  `Last seen: ${status}`;
       selected_friend_profile_img.src = profileUrl;
         
       selected_friend_profile_container.style.visibility = 'visible';
       if(message_send_box.style.visibility != 'visible') message_send_box.style.visibility = 'visible';
       no_chat_popup.style.display = 'none';
       friend_continer.classList.add('active');
      
         loadLoadingPopup();
        //  console.log(chatIdObj);
         currentChatRequestId = Math.round(1+Math.random()*100000);
         let result = await fetch('/chat/get_chats',{
             method:'post',
             headers:{
                'Content-Type':'application/json'
             },
             body:JSON.stringify({chatId:chatIdObj[selectedFriendIndex].chatId,
                  friend:chatIdObj[selectedFriendIndex].friend,
                  requestId:currentChatRequestId
            })
         })
         
         result = await result.json();

         if(result.requestId === currentChatRequestId){
            // desabling chat count
            // console.log(chatIdObj);
            console.log(selectedFriendIndex);
            document.getElementById(chatIdObj[selectedFriendIndex].friend).style.display = 'none';
            document.getElementById(chatIdObj[selectedFriendIndex].friend).innerHTML = '<p>0</p>';
            if(result.chats){
              loading_box.style.display = 'none';
               console.log(result);
               let chatCountIndex = result.chatData.length - result.chatCount;
              let message = '';
               for(let i = 0;i < result.chatData.length;i++){
                 let chat = result.chatData[i];
                 let time,d,date;
                    if(chatCountIndex === i){
                      message = message + `<li id = 'unread-chat-count'>
                                                unread messages
                                           </li>`;
                    }
                    if(result.owner === chat.user){
                          d = new Date(chat.timeStamp);
                          time = formatAMPM(d);
                          date = `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`
                          message = message + `<li class="clearfix">
                                            <div class="message-data text-right">
                                                 <span class="message-data-time">${time}, ${date}</span>
                                            </div>
                                            <div class="message other-message float-right"> 
                                            ${chat.message}
                                            </div>
                                       </li>`;
                    }else {
                      d = new Date(chat.timeStamp);
                      time = formatAMPM(d);
                      date = `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`;
    
                      message = message + `<li class="clearfix">
                                     <div class="message-data">
                                         <span class="message-data-time">${time}, ${date}</span>
                                     </div>
                                     <div class="message my-message">${chat.message}</div>                                    
                                 </li>                               `
                  }
                }
                message_container.insertAdjacentHTML('beforeend',message);
              
            }else {
              loading_box.style.display = 'none';
              console.log(loading_box);
            }
            //  send_mess_input_field.addEventListener('click',sendMessage);
            send_mess_input_field.addEventListener('keypress',sendMessage)
         }
       }
    });


    add_friend_btn.addEventListener('click',() => {
      popup_frame.classList.add('appear');
      popup.setAttribute('id','move');
      popup.classList.remove('mt-5');
      popup.classList.remove('fadeout');

    });


    popup_frame.addEventListener('click',(e) => {
      if(e.target.getAttribute('id') === 'popup-frame' || e.target.classList.contains('container')){
        search_input.value = ''
        if(search_user_box.children.length === 3){
          search_user_box.removeChild(search_user_box.children[2]);
        }
        search_status_bar.innerText = 'Search results'
        popup.removeAttribute('id','move');
        popup.classList.add('fadeout');
        popup.classList.add('mt-5');
        popup_frame.classList.remove('appear');
      }
    });

    message_container.addEventListener('scroll',async (e) => {
      let chatLength = message_container.children.length;
      if(e.target.scrollTop === 0){
          if(chatHistoryRequestId === 'None' && isChatDataAvailableForCurrentUser === true){
              chatHistoryRequestId = 'pending';
              loadLoadingPopup();
              let chatId = chatIdObj[selectedFriendIndex].chatId;
               let result = await fetch('/chat/chatHistory',{
                   method:'post',
                   headers:{'Content-Type':'application/json'},
                   body:JSON.stringify({chatLength:chatLength,chatId:chatId})
               });

               result = await result.json();
               if(result.chatsRemaining){
                loading_box.style.display = 'none';
                let chatsArr = result.chats;
                console.log(chatsArr);
                    // now just append chats to message container 
                    // while appending chats needs to show loading popup
                    let message = '';
               for(let i = 0;i < chatsArr.length;i++){
                 let chat = chatsArr[i];
                 let time,d,date;
                    if(result.owner === chat.user){
                          d = new Date(chat.timeStamp);
                          time = formatAMPM(d);
                          date = `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`
                          message = message + `<li class="clearfix">
                                            <div class="message-data text-right">
                                                 <span class="message-data-time">${time}, ${date}</span>
                                            </div>
                                            <div class="message other-message float-right"> 
                                            ${chat.message}
                                            </div>
                                       </li>`;
                    }else {
                      d = new Date(chat.timeStamp);
                      time = formatAMPM(d);
                      date = `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`;
    
                      message = message + `<li class="clearfix">
                                     <div class="message-data">
                                         <span class="message-data-time">${time}, ${date}</span>
                                     </div>
                                     <div class="message my-message">${chat.message}</div>                                    
                                 </li>                               `
                  }
                }
                message_container.insertAdjacentHTML('afterbegin',message);
                chatHistoryRequestId = 'None';
               }else {
                isChatDataAvailableForCurrentUser = false;
                loading_box.style.display = 'none';
               }


          }
      }
  });

  filter_friends_search.addEventListener('keyup',searchFilter);
    socket.on('receive-message',(message,timestamp) => {
      let d = new Date(timestamp);
      let time = formatAMPM(d);
      let date = `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`
        let mess = `<li class="clearfix">
                        <div class="message-data">
                             <span class="message-data-time">${time}, ${date}</span>
                        </div>
                   <div class="message my-message">${message}</div>
                   </li> `;
                   message_container.insertAdjacentHTML('beforeend',mess);
                   message_container.scrollTop = message_container.scrollHeight;       
    })

    socket.on('unread-message-count',(fri_name) => {
       let message_count = document.getElementById(fri_name);
       message_count.style.display = 'flex'
       message_count.innerText = Number(message_count.innerText.trim())+1;
    })

    socket.on('update-users-status',(fri_name,timeStamp) => {
      console.log(timeStamp);
        let element = document.getElementById(fri_name);
        element = element.previousElementSibling;
        element.children[1].classList.toggle('offline');
        element.children[1].classList.toggle('online');
        let status_time = timeSince(new Date(timeStamp));
        console.log(status_time);
        element.children[1].innerHTML = `<i class="fa fa-circle offline"></i> ${status_time}`; 
        selected_friend_status.innerText = `Last seen: ${status_time}`;
    })
    
    socket.on('friend-connect',(fri_name) => {
      console.log(fri_name);
      let element = document.getElementById(fri_name);
      element = element.previousElementSibling;
      console.log(element);
      element.children[1].classList.toggle('offline');
      element.children[1].classList.toggle('online');
      let ch = `<i class="fa fa-circle online"></i> online`
      element.children[1].innerHTML = ch;
      selected_friend_status.innerText = 'online';
    })

    socket.on('add-new-friend',(dataObj) => {
        let user = `<li class="clearfix fri-list">
                         <img src=${dataObj.pro} alt="avatar">
                         <div class="about">
                               <div class="name">${dataObj.user}</div>
                               <div class="status"> <i class="fa fa-circle online"></i> online </div>                                            
                          </div>
                          <div class = 'unchecked-mess-box' id = '${dataObj.user}'> 
                               <p>0</p> 
                          </div>
                    </li>`;
           peopleList.insertAdjacentHTML('beforeend',user); 
           no_friends_popup.style.visibility = 'hidden'; 
           
           chatIdObj[peopleList.children.length-1] = {
               friend: dataObj.user,
               chatId: dataObj.chatId
           }
          //  console.log(chatIdObj);
    })

function removeAllChildren(parent){
  while(parent.firstChild){
     parent.removeChild(parent.firstChild);
  }

 //  console.log(parent)
}

function loadLoadingPopup() {
 if(getComputedStyle(no_chat_popup).display == 'block'){
   no_chat_popup.style.display = 'none';
 }
 loading_box.style.display = 'flex';
}

function timeSince(date) {
        console.log('came');
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
  console.log(seconds);
  if(seconds < 1) return `1 second ago`;

  return seconds === 1 ? `${seconds} second ago`:`${seconds} seconds ago`;
}


function sendMessage(e) {
let input = send_mess_input_field.value.trim();
 if(e.key === 'Enter'){
   let d = new Date();
    let time = formatAMPM(d);
    let date = `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`
   let message = `<li class="clearfix">
                       <div class="message-data text-right">
                            <span class="message-data-time">${time}, ${date}</span>
                       </div>
                       <div class="message other-message float-right"> 
                           ${input}
                       </div>
                  </li>`;

    message_container.insertAdjacentHTML('beforeend',message);
    console.log(message_container.scrollHeight);
    console.log(message_container.scrollTop);
    console.log(message_container.s);
    message_container.scrollTop = message_container.scrollHeight;
    // now sending message to user
    send_mess_input_field.value = '';
    if(chatIdObj[selectedFriendIndex]){
      let messageBox = {
        friendName:selectedFriendName,
        chatId:chatIdObj[selectedFriendIndex].chatId,
        message:input.trim(),
        timeStamp:d
      }
      console.log(messageBox);
      socket.emit('send-message',messageBox)
    }

 }
}  


function formatAMPM(date) {
var hours = date.getHours();
var minutes = date.getMinutes();
var ampm = hours >= 12 ? 'pm' : 'am';
hours = hours % 12;
hours = hours ? hours : 12; // the hour '0' should be '12'
minutes = minutes < 10 ? '0'+minutes : minutes;
var strTime = hours + ':' + minutes + ' ' + ampm;
return strTime;
}


async function iitializeFriends() {
  let friends = await fetch("/chat/get_friends", {
    method: "get",
  });

  friends = await friends.json();
  console.log(friends);
  if (friends.hasFriends) {
    let list = "";
    for (let i = 0; i < friends.data.length; i++) {
      chatIdObj[i] = {
        friend: friends.data[i].friendName,
        chatId: friends.data[i].chatId,
      };
      let status;
      let active = "offline";
      if (friends.data[i].status === "online") {
        status = "online";
        active = "online";
      } else if (friends.data[i].status !== "New User") {
        status = timeSince(new Date(friends.data[i].status));
      } else {
        status = friends.data[i].status;
      }

      let chatCountVisibility = "";
      if (friends.data[i].unReadChatCount) chatCountVisibility = "visible";

      list =
        list +
        `<li class="clearfix fri-list">
                          <img src=${friends.data[i].profileUrl} alt="avatar">
                          <div class="about">
                             <div class="name">${friends.data[i].friendName}</div>
                             <div class="status"> <i class="fa fa-circle ${active}"></i> ${status} </div>                                            
                          </div>
                          <div class = 'unchecked-mess-box ${chatCountVisibility}' id = '${friends.data[i].friendName}'> 
                              <p>${friends.data[i].unReadChatCount}</p> 
                          </div>
                      </li>`;
    }
    peopleList.innerHTML = list;
    // console.log(chatIdObj);
  } else if (!friends.hasFriends) {
    no_friends_popup.style.display = "flex";
  }
}


search_user_btn.addEventListener('click',async(e) => {
  if(search_user_box.children.length === 3){
      search_user_box.removeChild(search_user_box.children[2]);
  }
   let userInput;
   if(search_input.value.trim().length === 0){
    search_input.setCustomValidity("Empty");
    search_input.reportValidity();
   }else {
       search_status_bar.innerText = 'Searching...'
       userInput = search_input.value.trim();
       // to find friends to add in your friendslist
       // sending friend name to server for look up
       let result = await fetch('/search/getUserInfo',{
           method:'post',
           headers:{
               'Content-Type':'application/json'
           },
           body:JSON.stringify({username:userInput})
       });
       result = await result.json();
       if(result.userExist){
          search_status_bar.innerText = 'Search Results';
           let friendName = result.friendName;
           let profileUrl = result.profileUrl;

           let friend_cart = ` <div id = 'user-cart'class="flex-row justify-content-between mb-3">
                                  <div class="d-flex flex-column p-3" id = 'username-cart'>
                                           <p class="mb-1">${friendName} </p>
                                  </div>
                               <div id = 'user-cart-box'class="price" >
                                    <div id = 'user-pic' styele='background-image:${profileUrl}'> </div>
                               </div>
                               </div>`;

          //  search_user_box.innerHTML = search_user_box.innerHTML+friend_cart;  
           search_user_box.insertAdjacentHTML('beforeend',friend_cart);  
           let user_cart = document.getElementById('user-cart');
             user_cart.addEventListener('click',addFriend);

       }else if(result.alreadyFriend){
          search_status_bar.innerText = 'Already your friend..';
       }else {
          search_status_bar.innerText = 'No results Found';
       }


   }
});

async function addFriend(e) {
    search_status_bar.innerText = 'Adding friend...';
    // let friendName = e.currentTarget.children[0].children[0].innerText;

        let result = await fetch('/search/addFriend');

        result = await result.json();
        if(result.friendAdded){
          let status;
          let active = 'offline';
          if(result.status === 'online'){
              status = 'online';
              active = 'online';
          }else if(result.status !== 'New User'){
              status = timeSince(new Date(result.status)); 
          }else {
             status = result.status;
          }
            console.log(status);
            console.log(result);
            let friend = `<li class="clearfix">
                             <img src="${result.profileUrl}" alt="avatar">
                             <div class="about">
                                 <div class="name">${result.friendName}</div>
                                 <div class="status"> <i class="fa fa-circle ${active}"></i> ${status} </div>                                            
                             </div>
                             <div class = 'unchecked-mess-box' id = '${result.friendName}'> 
                              <p>0</p> 
                             </div>
                          </li>`;       
            peopleList.insertAdjacentHTML('beforeend',friend);
            chatIdObj[peopleList.children.length-1] = {
              friend: result.friendName,
              chatId: result.chatId
          }
          // console.log(chatIdObj);
            // now remove search popup
            // also remove noFriends popup , because if you are a new user you will have it 
            let noFriendsPopup = document.getElementById('no-friends');
            if(noFriendsPopup){
              if(getComputedStyle(noFriendsPopup).display === 'flex') noFriendsPopup.style.display = 'none';
            }
            search_input.value = '';
            if(search_user_box.children.length === 3){
                  search_user_box.removeChild(search_user_box.children[2]);
            }
            popup.removeAttribute('id','move');
            popup.classList.add('fadeout');
            popup.classList.add('mt-5');
            popup_frame.classList.remove('appear');
        }else{
           // code if server could not add friend
        }
    
}


async function searchFilter(e) {
    console.log('called')
    if(e.key === 'Backspace'){
        
    }else {
        let name = e.target.value.trim();
        let length = Object.keys(chatIdObj);
        console.log(length)
        for(let i = 0;i < length.length;i++){
            let friendObj = chatIdObj[i];
            console.log(friendObj.friend);
            if(!friendObj.friend.includes(name)){
                peopleList.children[i].style.display = 'none';
            }
        }
    }
}
// function timeSince(date) {

//   var seconds = Math.floor((new Date() - date) / 1000);

//   var interval = seconds / 31536000;

//   let finalTime;
//   if (interval > 1) {
//     finalTime = Math.floor(interval);
//     return finalTime === 1 ? `${finalTime} year ago`:`${finalTime} years ago`;
//   }
//   interval = seconds / 2592000;
//   if (interval > 1) {
//     finalTime = Math.floor(interval);
//     return finalTime === 1 ? `${finalTime} month ago`:`${finalTime} months ago`;
//   }
//   interval = seconds / 86400;
//   if (interval > 1) {
//     finalTime = Math.floor(interval);
//     return finalTime === 1 ? `${finalTime} day ago`:`${finalTime} days ago`;

//   }
//   interval = seconds / 3600;
//   if (interval > 1) {
//     finalTime = Math.floor(interval);
//     return finalTime === 1 ? `${finalTime} hour ago`:`${finalTime} hours ago`;
//   }
//   interval = seconds / 60;
//   if (interval > 1) {
//     finalTime = Math.floor(interval);
//     return finalTime === 1 ? `${finalTime} minute ago`:`${finalTime} minutes ago`;
//   }
//   return interval === 1 ? `${interval} second ago`:`${interval} seconds ago`;
// }
})();