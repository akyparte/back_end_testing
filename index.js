const express = require('express');
const cookie = require('cookie');
const login_system_route = require('./Routers/login_system_routes');
const forgot_route = require('./Routers/forgot_password_routes');
const clsTokenValidation = require('./middlewareFiles/validateToken');
const objTokenValidation = new clsTokenValidation();
const cookieParser = require('cookie-parser');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const socketUsers = require('./DATA_SPACE/online_users');
const jwt = require('jsonwebtoken');
const cls_db_functions = require('./databaseFiles/db_functions');
const e = require('express');
app.set('view engine', 'pug')
const objDbFunctions = new cls_db_functions();



app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static(__dirname+'/public'));


app.get('/', objTokenValidation.varifyToken,(req, res) => {
  res.sendFile(__dirname + '/staticPages/sign_up_in_page.html');

});

app.use('/',login_system_route);

app.use('/forgot_password',forgot_route);

app.get('/chat',objTokenValidation.isTokenExisted,async (req,res) => {
        let userInfo = jwt.decode(req.cookies.jwt);
        let userFriends = await objDbFunctions.getUserFriends(userInfo.username);

        if(userFriends.length === 0){
          res.sendFile(__dirname+'/staticPages/chat_app_initialise_user.html');
        }else {
          res.json({page:'ddvd'});
        } 

})


app.get('*',(req,res) => {
     res.sendStatus(404);
})
io.on('connection', (socket) => {
   let cook =  cookie.parse(socket.handshake.headers.cookie);
   
    let user = jwt.decode(cook.jwt);
    
     let result = socketUsers.users.find(userObj => userObj.user === user.username);
     if(result){
        result.SID = socket.id;
     }else socketUsers.users.push({user:user.username, SID:socket.id});

  // console.log('a user connected');
  // console.log(io.sockets.sockets.get());
  console.log(socketUsers.users);

  socket.on('message',(o) => {
     let friend = socketUsers.users.find((e) => e.user === o.username);
     if(friend){
       let friend_socket = io.sockets.sockets.get(friend.SID);
       console.log();
       friend_socket.emit('message',{message:o.message});
     }
  })
});

server.listen(8000,'192.168.0.105',() => {
  console.log('listening on *:8000');
});
