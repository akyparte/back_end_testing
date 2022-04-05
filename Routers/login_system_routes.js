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
      //  let loginStatus = await objDbFunctions.isLoggedIn(username);
      //  if(loginStatus){
      //     res.json({response:'alreadyLoggedIn'});
      //     return;
      //  }
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

router.get('/signout',objTokenValidation.varifyToken,(req,res) => {
    // now delete token cookie from browser 
    // and redirect that person to login page
    res.clearCookie('jwt');
    res.redirect('/');
})

router.post('/signup',objTokenValidation.varifyToken,async(req,res) => {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    // now i need a database function which can tell me if this user exists or not
    // if exists return already_available
    // otherwise created
    let result = await objDbFunctions.addUser(username,password,email);
    if(result.isCreated){
      res.json({response:'created'});
    }else {
      res.send({response:'alreadyAvailable'})
    }

});

module.exports = router;