var express = require('express');
var router = express.Router();
let config = require('../config');
const clsTokenValidation = require('../middlewareFiles/validateToken');
const objTokenValidation = new clsTokenValidation();
const cls_db_functions = require('../databaseFiles/db_functions');
const objDbFunctions = new cls_db_functions();
const jwt = require('jsonwebtoken');

router.post('/signin',objTokenValidation.varifyToken,async (req,res) => {
    let username = req.body.username;
    let password = req.body.password;
    
    if(username&&password){
        let result = await objDbFunctions.isRegisteredUser(username,password);
        if(result.alreadyLoggedIn){
           res.json({response:'alreadyLoggedIn'});
           return;
        }else if(result.validUser){
            await objDbFunctions.makeUserLoggedIIN(username);  
            let payload = {
               username:username,
               // date:Date.now(),
               // id:result.user.uniqueID
            }
            let token = jwt.sign(payload,config.JWTKEY);
            res.cookie('jwt',token);
            res.json({ response:'authenticated' });
        }else {
            res.json({ response:'unauthenticated' });
        }
    }
});

router.get('/signout',objTokenValidation.verifyLogoutRequest,async (req,res) => {
    // now delete token cookie from browser 
    // and redirect that person to login page
    if(req.cookies && req.cookies.jwt){
      var userInfo = jwt.decode(req.cookies.jwt);
      let result = await objDbFunctions.makeUserLoggedOut(userInfo.username);
      if(result){
        res.clearCookie('jwt');
        res.json({LOGOUT:true})
      }else {
        res.json({LOGOUT:false})
      }
    }
})

router.post('/signup',objTokenValidation.varifyToken,async(req,res) => {
    if(req.body && req.body.username && req.body.password && req.body.email){
        let username = req.body.username;
        let password = req.body.password;
        let email = req.body.email;

        let result = await objDbFunctions.addUser(username,password,email);
        if(result.isCreated){
          res.json({response:'created'});
        }else {
          res.json({response:'alreadyAvailable'})
        }
    }else {
        res.json({isEmptyRequest:true});
    }
});

module.exports = router;