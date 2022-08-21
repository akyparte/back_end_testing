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



router.get('/',async (req,res) => {
    if(req.cookies && req.cookies.jwt){
        let userInfo = jwt.decode(req.cookies.jwt);

        let result = await objDbFunctions.getUserProfile(userInfo.username);

        if(result.userExists){
           res.json({src:result.profileUrl,username:userInfo.username,successfull:true});
        }else {
           res.json({successfull:false});
        }
     }else {
        res.json({ emptyRequest: true });
     }

})

router.post('/save_profile',async (req,res) => {
   if(req.cookies && req.cookies.jwt){
      let userInfo = jwt.decode(req.cookies.jwt);
      let profile = req.files.userProfile[0].filename;
      let result = await objDbFunctions.updateUserProfile(userInfo.username,profile);

      if(result.profileUpdated){
         res.json({profileSrc:profile,successfull:true});
      }else {
         res.json({successfull:false});
      }
   }else {
      res.json({ emptyRequest: true });
   }
})



module.exports = router;

