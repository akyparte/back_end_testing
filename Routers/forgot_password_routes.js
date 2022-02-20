const express = require('express');
const router = express.Router();
const nodeMailer = require('nodemailer');
const config = require('../config');
const path = require('path');
const cls_db_functions = require('../databaseFiles/db_functions');
const objDbFunctions = new cls_db_functions();




router.get('/',(req,res) => {
    resolved = path.resolve(__dirname,'../staticPages/forgot.html');
    res.sendFile(resolved)
})

router.post('/send_email',async (req,res) => {
    if(req.body.username){
       let result = await objDbFunctions.validateUserForOTP(req.body.username);
    if(result.isOTPGenerated){
        let OTP_message = config.OTP_message.replace('[OTP]',result.OTP);

        let email_auth = nodeMailer.createTransport({
            service:'gmail',
            auth:{
                user:config.email,
                pass:config.em_password

            }
        })

        let emailOptions = {
            from:config.email,
            to:result.userData.email,
            subject:config.em_subject,
            text:OTP_message
        }
       
       try{
           let info = await email_auth.sendMail(emailOptions);
              if(info.accepted.length > 0){
                  res.json({
                      response:'OTPSENT'
                  })
              }else {
                  res.json({
                      response:'SERVERERROR'
                  });
              }
       }catch(err){
         console.log(err);
       }    
    }else {
        res.json({response:'OTPNOTSENT'});
    }
        

   }
})

router.post('/validateOTP',async (req,res) => {
    if(req.body.username && req.body.OTP){
       let result = await objDbFunctions.validateOTP(req.body.username, req.body.OTP);
       if(result.isOTPValidated){
           res.json({response:'ACCESSALLOWED'});
       }else {
        res.json({response:'ACCESSDENIED'});
       }
       
    }
})

router.post('/save_new_pass',async (req,res) => {

    if(req.body.username && req.body.password){
        let result = await objDbFunctions.saveNewPassword(req.body.username , req.body.password);

        if(result.passChanged){
            res.json({response:'PASSWORDISCHANGED'})
        }else {
            res.json({response:'PASSWORDNOTCHANGED'})
        } 
    }


})



module.exports = router;