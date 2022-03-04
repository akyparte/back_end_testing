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

         }else {
             search_status_bar.innerText = 'Searching...'
             userInput = search_input.value.trim();
             // to find friends to add in your friendslist
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
                 let profileSrc = result.profileSrc;

                 let friend_cart = ` <div id = 'user-cart'class="flex-row justify-content-between mb-3">
                                        <div class="d-flex flex-column p-3" id = 'username-cart'>
                                                 <p class="mb-1">${friendName} </p>
                                        </div>
                                     <div id = 'user-cart-box'class="price" >
                                          <div id = 'user-pic' styele='background-image:${profileSrc}'> </div>
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
          search_status_bar = 'Adding friend...';
          let friendName = e.currentTarget.children[0].children[0].innerText;
          if(friendName){
              let result = fetch('/search/addFriend',{
                  method:'get',
              });

              result = await result.json();
              if(result.friendAdded){
                let status;
                let active = 'offline';
                if(result.status === 'online'){
                    status = 'online';
                    active = 'online';
                }else if(status !== 'new User'){
                    status = timeSince(new Date(result.status)); 
                }
                  let friend = `<li class="clearfix">
                                   <img src="${result.profileSrc}" alt="avatar">
                                   <div class="about">
                                       <div class="name">${result.friendName}</div>
                                       <div class="status"> <i class="fa fa-circle ${active}"></i> ${status} </div>                                            
                                   </div>
                               </li>`;
                  peopleList.insertAdjacentElement('beforeend',friend);
                  
                  // now remove search popup
                  search_input.value = ''
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
    }

})();