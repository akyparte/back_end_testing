const express = require('express');
const clsTokenValidation = require('../middlewareFiles/validateToken');
const objTokenValidation = new clsTokenValidation();
const jwt = require('jsonwebtoken');
const cls_db_functions = require('../databaseFiles/db_functions');
const objDbFunctions = new cls_db_functions();
const path = require('path');
const router = express.Router();
const onlineUsers = require('../DATA_SPACE/online_users');





router.get("/", async (req, res) => {
    res.sendFile(
      path.resolve(__dirname + "/../staticPages/chat_app_logged_user.html")
    );
});

router.get("/get_friends", async (req, res) => {
  let userInfo = jwt.decode(req.cookies.jwt);
  let userFriends = await objDbFunctions.getUserFriends(userInfo.username);

   if(userFriends.length){
     let friendsData = [];
   
       for(let i = 0;i < userFriends.length;i++){
            if(onlineUsers[userFriends[i].dataValues.friend]){
             friendsData.push({
                friendName:userFriends[i].dataValues.friend,
                profileUrl: userFriends[i].dataValues.profileUrl,
                status:'online'
             })
            }else {
                let userTimeStamp = await objDbFunctions.getUsersTimeStamp(userFriends[i].dataValues.friend);
   
                if(userTimeStamp.notUsedEvenOnce){
                  friendsData.push({
                     friendName:userFriends[i].dataValues.friend,
                     profileUrl: userFriends[i].dataValues.profileUrl,
                     status:'New User'
                  })
                }else {
                 friendsData.push({
                   friendName:userFriends[i].dataValues.friend,
                   profileUrl: userFriends[i].dataValues.profileUrl,
                   status:userTimeStamp.result.status
                })
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
    let friendName = req.body.friendName;
    if(req.cookies.jwt){
      var userInfo = jwt.decode(req.cookies.jwt);
      
    }

    let chats = await objDbFunctions.getChats(userInfo.username,friendName);
    if(!chats.chatsAvailable){
        res.json({response:'NOCHATS'});
    }
})


module.exports = router;