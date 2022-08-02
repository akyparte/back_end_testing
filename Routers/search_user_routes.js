const express = require('express');
const router = express.Router();
// const objTokenValidation = new clsTokenValidation();
const jwt = require('jsonwebtoken');
const config = require('../config');
const onlineUsers = require('../DATA_SPACE/online_users');
const cls_db_functions = require('../databaseFiles/db_functions');
const objDbFunctions = new cls_db_functions();
let socket_route = require('../socket_management/sockets');
let activeFriends = require('../usersActiveFriends/activeFriends');


router.post('/getUserInfo',async (req,res) => {
    if(req.cookies && req.cookies.jwt && req.body && req.body.username){
       let username = jwt.decode(req.cookies.jwt).username;
       let friendName = req.body.username;

       if(friendName === username){
          res.json({userExist:false});
          return;
       }
       let checkFriend = await objDbFunctions.isAlreadyFriend(username,friendName);
       if(checkFriend.alreadyFriend){
          res.json({alreadyFriend:true});
          return;
       }
       let user = await objDbFunctions.getUserWithProfileAndStatus(friendName);
       if(user.userExists){
            let frd = jwt.sign({friendName:user.username,profileUrl:user.profileUrl,timeStamp:user.timeStamp},config.JWTKEY);
            res.cookie('frd',frd);
            res.json({userExist:true,friendName:user.username,profileUrl:user.profileUrl});
       }else {
            res.json({userExist:false})
        }
    }
})

router.get('/addFriend',async (req,res) => {
   if(req.cookies && req.cookies.frd){

      let io = socket_route.getSocketToRoutes();
      let friendInfo = jwt.decode(req.cookies.frd);
      let friendName = friendInfo.friendName;
      let FriendProfileUrl = friendInfo.profileUrl;
      let friendsTimeStamp = friendInfo.timeStamp;
      let username = jwt.decode(req.cookies.jwt).username;
      console.log(friendInfo);
      if(onlineUsers[friendName]){

           // first add user in his friends database 
           //then add user's friend in users database
            // later i have to send users info to his friend 
          // because user will be added in his friends account
         let result = await objDbFunctions.saveNewFriend(username,friendName,FriendProfileUrl,true);
         if(result.friendAdded){
              res.json({
                  friendAdded:true,
                  status:'online',
                  friendName:friendName,
                  profileUrl:FriendProfileUrl,
                  chatId:result.usersData.chatId
               });
               console.log(result.usersData)
               io.to(onlineUsers[friendName]).emit('add-new-friend',result.usersData);
         }else {
           res.json({friendAdded:false});
        }
      }else {
         let result = await objDbFunctions.saveNewFriend(username,friendName,FriendProfileUrl,false);
         if(result.friendAdded){
            res.json({
               friendAdded:true,
               status:friendsTimeStamp,
               friendName:friendName,
               profileUrl:FriendProfileUrl,
               chatId:result.chatId
            });
         }else {
            res.json({friendAdded:false});
         }
      }
   // saving friend name in chatCount table for counting unreadchats

   await objDbFunctions.createUserForChatCount(username,friendName);
   if(activeFriends[username]){
      activeFriends[username][friendName] = 0;
   }else {
      activeFriends[username] = {
         [friendName]:0
      }
   }

   if(activeFriends[friendName]){
      activeFriends[friendName][username] = 0;
   }else {
      activeFriends[friendName] = {
         [username]:0
      }
   }
   }

})



module.exports = router;