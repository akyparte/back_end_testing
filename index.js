const express = require('express');
const cookie = require('cookie');
const login_system_route = require('./Routers/login_system_routes');
const forgot_route = require('./Routers/forgot_password_routes');
const clsTokenValidation = require('./middlewareFiles/validateToken');
const objTokenValidation = new clsTokenValidation();
const chat_router = require('./Routers/chat_home_routes');
const cookieParser = require('cookie-parser');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const socketUsers = require('./DATA_SPACE/online_users');
const jwt = require('jsonwebtoken');
const config = require('./config');
const cls_db_functions = require('./databaseFiles/db_functions');
const objDbFunctions = new cls_db_functions();




app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static(__dirname+'/public'));


app.get('/', objTokenValidation.varifyToken,(req, res) => {
  res.sendFile(__dirname + '/staticPages/sign_up_in_page.html');

});

app.use('/',login_system_route);

app.use('/forgot_password',objTokenValidation.isTokenExisted,forgot_route);

app.use('/chat',objTokenValidation.isTokenExisted,chat_router)




app.get('*',(req,res) => {
     res.sendStatus(404);
})
io.on('connection', (socket) => {
  if(!socket.handshake.headers.cookie)return;
   let cook =  cookie.parse(socket.handshake.headers.cookie);

   let user = jwt.decode(cook.jwt);
   
   //  let result = socketUsers.users.find(userObj => userObj.user === user.username);
   let result = socketUsers[user.username];
   if(result){
     socketUsers[user.username] = socket.id;
    }else socketUsers[user.username] = socket.id;
    
    console.log(socketUsers);

    socket.on('disconnect',async() => {
        if(socket.handshake.headers.cookie){
          let cook =  cookie.parse(socket.handshake.headers.cookie);
          let userToken = jwt.decode(cook.jwt);
          let user = await objDbFunctions.saveUsersTimeStamp(userToken.username,socket.handshake.time);
          delete socketUsers[userToken.username];
          console.log(socketUsers);
        }
    });

});

server.listen(8000,'192.168.0.105',() => {
  console.log('listening on *:8000');
});
