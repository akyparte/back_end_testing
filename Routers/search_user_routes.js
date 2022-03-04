const express = require('express');
const router = express.Router();
// const objTokenValidation = new clsTokenValidation();
const jwt = require('jsonwebtoken');
const config = require('../config');

const cls_db_functions = require('../databaseFiles/db_functions');
const objDbFunctions = new cls_db_functions();


router.post('/getUserInfo',async (req,res) => {
       
       let user = await objDbFunctions.getUserWithProfile(req.body.username);
       if(user.userExists){
            let frd = jwt.sign({friendName:user.username,profileSrc:user.profileSrc},config.JWTKEY);
            res.cookie('frd',frd);
            res.json({userExist:true,friendName:user.username,profileSrc:user.profileSrc})
       }else {
            res.json({userExist:false})
        }
    
    
})

router.post('/addFriend',async (req,res) => {

  let friendInfo = jwt.decode(req.cookies.frd).friendName;
  let friendName = friendInfo.friendName;
  let profileSrc = friendInfo.profileSrc
  let username = jwt.decode(req.cookies.jwt).username;

  let result = await objDbFunctions.saveNewFriend(username,friendName,profileSrc);
   if(result.friendAdded){
      res.json({friendAdded:true,status:result.timeStamp,friendName:friendName,profileSrc:profileSrc});
   }else {
      res.json({friendAdded:false})
   }
})



module.exports = router;