const express = require('express');
const cls_db_functions = require('./db_functions');
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
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/page.html');

});

app.get('/home',(req,res) => {
    // now i 'll get jwt from cookie take username from it
    // make request to database get his info 
    // and create his page dynamically
    res.json({home:'hhhoommmmee'});
})

app.post('/signin',async (req,res) => {
    let username = req.body.username;
    let password = req.body.password;
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
    res.clearCookie();
})

app.post('/signup',(req,res) => {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    // now i need a database function which can tell me if this user exists or not
    // if exists return already_available
    // otherwise created

})

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(4000,() => {
  console.log('listening on *:4000');
});

function isValidUser(req,res,next) {
     
}