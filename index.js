const express = require('express');
const clsTokenValidation = require('./middlewareFiles/validateToken');
const objTokenValidation = new clsTokenValidation();
const cls_db_functions = require('./databaseFiles/db_functions');
const objDbFunctions = new cls_db_functions();
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { config } = require('process');
const io = new Server(server);
app.use(cookieParser());
app.use(express.json())
app.use(express.static(__dirname+'/public'));
app.get('/', objTokenValidation.varifyToken,(req, res) => {
  res.sendFile(__dirname + '/staticPages/sign_up_in_page.html');

});

app.get('/chat',objTokenValidation.isTokenExisted,(req,res) => {
    // now i 'll get jwt from cookie take username from it
    // make request to database get his info 
    // and create his page dynamically
    res.json({chat:'hhhoommmmee'});
})

app.post('/signin',objTokenValidation.varifyToken,async (req,res) => {
    let username = req.body.username;
    let password = req.body.password;
    console.log(username,password);
    if(username&&password){
        let result = await objDbFunctions.isRegisteredUser(username,password);
        if(result.validUser){
          let payload = {
            username:username,
            date:Date.now(),
            id:result.user.uniqueID
          }
          let token = jwt.sign(payload,config.JWTKEY);
          res.cookie('jwt',token);
          res.json({ response:'authenticated' });
        }
          // need to make request to database and validate user
           // now redirect user to chat site
  
    }else {
      res.sendStatus(400);
    }
});

app.get('/signout',(req,res) => {
    // now delete token cookie from browser 
    // and redirect that person to login page
    res.clearCookie('jwt');
})

app.post('/signup',objTokenValidation.varifyToken,async(req,res) => {
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

})

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(4000,() => {
  console.log('listening on *:4000');
});

function isValidUser(req,res,next) {
     
}