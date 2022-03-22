const express = require('express');
const clsTokenValidation = require('../middlewareFiles/validateToken');
const objTokenValidation = new clsTokenValidation();
const jwt = require('jsonwebtoken');
const cls_db_functions = require('../databaseFiles/db_functions');
const objDbFunctions = new cls_db_functions();
const path = require('path');
const router = express.Router();
const onlineUsers = require('../DATA_SPACE/online_users');
let activeFriends = require('../usersActiveFriends/activeFriends');
const { username } = require('../config');
let unReadChatCount = require('../unReadChats/unreadChatsCount');
let chatsArray = require('../chats/chats_array');







router.get("/", async (req, res) => {
    res.sendFile(
      path.resolve(__dirname + "/../staticPages/chat_app_logged_user.html")
    );
});

router.get("/get_friends", async (req, res) => {
  let userInfo = jwt.decode(req.cookies.jwt);
  let userFriends = await objDbFunctions.getUserFriends(userInfo.username);

  // now while sending chat history i have to send chatcount also
  // if available for any user
   if(userFriends.length){
     let friendsData = [];
   
       for(let i = 0;i < userFriends.length;i++){
            let unreadMessageCount = await objDbFunctions.getUnreadChatCount(userInfo.username,userFriends[i].dataValues.friend);
            // let currentFriend = userFriends[i].dataValues.friend;
            // if(unReadChatCount[userInfo.username]){
            //   if(unReadChatCount[userInfo.username][currentFriend]){
            //      if(unReadChatCount[userInfo.username][currentFriend] > 0){
            //         unreadMessageCount = unreadMessageCount + unReadChatCount[userInfo.username][currentFriend];
            //      }
            //   }
            // }


        // here initializing activeFriends array with 0 means no friend is selected
        // later when user selects any user ill update with 1

        if(activeFriends[userInfo.username]){
             activeFriends[userInfo.username][userFriends[i].dataValues.friend] = 0;
         }else {
             activeFriends[userInfo.username] = {
                [userFriends[i].dataValues.friend]:0
             }
         }
            if(onlineUsers[userFriends[i].dataValues.friend]){
             friendsData.push({
                friendName:userFriends[i].dataValues.friend,
                profileUrl: userFriends[i].dataValues.profileUrl,
                status:'online',
                chatId:userFriends[i].dataValues.chatId,
                unReadChatCount:unreadMessageCount
             });
            }else {
                let userTimeStamp = await objDbFunctions.getUsersTimeStamp(userFriends[i].dataValues.friend);
   
                if(userTimeStamp.notUsedEvenOnce){
                  friendsData.push({
                     friendName:userFriends[i].dataValues.friend,
                     profileUrl: userFriends[i].dataValues.profileUrl,
                     status:'New User',
                     chatId:userFriends[i].dataValues.chatId,
                     unReadChatCount:unreadMessageCount
                  });
                }else {
                 friendsData.push({
                   friendName:userFriends[i].dataValues.friend,
                   profileUrl: userFriends[i].dataValues.profileUrl,
                   status:userTimeStamp.result.status,
                   chatId:userFriends[i].dataValues.chatId,
                   unReadChatCount:unreadMessageCount
                });
                }
            }
       }
     res.json({ hasFriends:true, data: friendsData });
   }else {
     // if user does not any friends
    res.json({ hasFriends: false });
   }
});


router.post('/get_chats',async(req,res) => {
    let chatId = req.body.chatId;
    var userInfo = jwt.decode(req.cookies.jwt);
    let chatCount = await objDbFunctions.getUnreadChatCount(userInfo.username,req.body.friend);
    let chats = await objDbFunctions.getChats(chatId,chatCount);
    if(chatsArray[chatId] && chatsArray[chatId].length > 0 && chats.chatsAvailable){
        chats.result.push(...chatsArray[chatId]);
        res.json({chats:true,owner:userInfo.username,chatData:chats.result,chatCount:chatCount,requestId:req.body.requestId});
        let result = await objDbFunctions.saveChats(chatId,chatsArray[chatId]);
        chatsArray[chatId] = [];
    }else if(chats.chatsAvailable){
      res.json({chats:true,owner:userInfo.username,chatData:chats.result,chatCount:chatCount,requestId:req.body.requestId})
    }else if(chatsArray[chatId] && chatsArray[chatId].length > 0){
      res.json({chats:true,owner:userInfo.username,chatData:chatsArray[chatId],chatCount:chatCount,requestId:req.body.requestId});
      let result = await objDbFunctions.saveChats(chatId,chatsArray[chatId]);
      chatsArray[chatId] = [];
    }else {
      res.json({chats:false,requestId:req.body.requestId});
    }

    // clearing chatCount from unReadChatCount array and database , becuase once user sees
    // chats means there are no unreadchat available
    if(unReadChatCount[userInfo.username] && unReadChatCount[userInfo.username][req.body.friend]){
      unReadChatCount[userInfo.username][req.body.friend] = 0;
    }
    await objDbFunctions.resetChatCount(userInfo.username,req.body.friend);

})


module.exports = router;