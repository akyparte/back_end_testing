const express = require('express');
const router = express.Router();
// const objTokenValidation = new clsTokenValidation();
const jwt = require('jsonwebtoken');
const config = require('../config');
const onlineUsers = require('../DATA_SPACE/online_users');
const cls_db_functions = require('../databaseFiles/db_functions');
const objDbFunctions = new cls_db_functions();
let socket_route = require('../socket_management/sockets');


router.post('/getUserInfo',async (req,res) => {
       let username = jwt.decode(req.cookies.jwt).username;
       let friendName = req.body.username;
       let checkFriend = await objDbFunctions.isAlreadyFriend(username,friendName);
       if(checkFriend.alreadyFriend){
          res.json({alreadyFriend:true});
          return;
       }
       let user = await objDbFunctions.getUserWithProfile(req.body.username);
       if(user.userExists){
            let frd = jwt.sign({friendName:user.username,profileUrl:user.profileUrl},config.JWTKEY);
            res.cookie('frd',frd);
            res.json({userExist:true,friendName:user.username,profileUrl:user.profileUrl});
       }else {
            res.json({userExist:false})
        }
    
    
})

router.get('/addFriend',async (req,res) => {
   let io = socket_route.getSocketToRoutes();
   console.log(io);
  let friendInfo = jwt.decode(req.cookies.frd);
  let friendName = friendInfo.friendName;
  let profileUrl = friendInfo.profileUrl
  let username = jwt.decode(req.cookies.jwt).username;

//   let result = await objDbFunctions.saveNewFriend(username,friendName,profileUrl);
//    if(result.friendAdded){
//       if(onlineUsers[friendName]){
//          res.json({friendAdded:true,status:'online',friendName:friendName,profileUrl:profileUrl});
//          io.to(onlineUsers[friendName]).emit('add-new-friend',result.newFriend);
//       }else {
//          res.json({friendAdded:true,status:result.timeStamp,friendName:friendName,profileUrl:profileUrl});
//       }
//    }else {
//       res.json({friendAdded:false})
//    }

   if(onlineUsers[friendName]){
        let result = await objDbFunctions.saveNewFriend(username,friendName,profileUrl,false);
        if(result.friendAdded){
           res.json({friendAdded:true,status:'online',friendName:friendName,profileUrl:profileUrl});
           io.to(onlineUsers[friendName]).emit('add-new-friend',result.newFriend);
        }else {
           res.json({friendAdded:false});
        }
   }else {
      let result = await objDbFunctions.saveNewFriend(username,friendName,profileUrl,true);
      if(result.friendAdded){
         res.json({friendAdded:true,status:result.timeStamp,friendName:friendName,profileUrl:profileUrl});
         io.to(onlineUsers[friendName]).emit('add-new-friend',result.newFriend);
      }else {
         res.json({friendAdded:false});
      }
   }
   // saving friend name in chatCount table for counting unreadchats

   await objDbFunctions.createUserForChatCount(username,friendName);

})



module.exports = router;