(async function () {
 
    let search_input = document.getElementById('search_user_input');
    let search_user_btn = document.getElementById('search_user_btn');
    let search_user_box = document.getElementById('search_user_box');
    let search_status_bar = document.getElementById('search_status_bar');
    let peopleList = document.getElementById('friends');
    let popup_frame = document.getElementById('popup-frame');
    let popup = document.querySelector('.card.mycard.mt-5.p-4');

    // let user_cart = document.getElementById('user-cart');

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
                  let friend = `<li class="clearfix">
                                   <img src="${result.profileUrl}" alt="avatar">
                                   <div class="about">
                                       <div class="name">${result.friendName}</div>
                                       <div class="status"> <i class="fa fa-circle ${active}"></i> ${status} </div>                                            
                                   </div>
                               </li>`;       
                  peopleList.insertAdjacentHTML('beforeend',friend);
                  
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