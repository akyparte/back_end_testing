const cookie = require('cookie');
const socketUsers = require('../DATA_SPACE/online_users');
const jwt = require('jsonwebtoken');
const config = require('../config');
const cls_db_functions = require('../databaseFiles/db_functions');
const objDbFunctions = new cls_db_functions();
let chatsArray = require('../chats/chats_array');


class socketHandling {
    static getSocket(io) {
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

              socket.on('send-message',(m) => {
                   console.log(m);
                   if(socket.handshake.headers.cookie){
                    let cook =  cookie.parse(socket.handshake.headers.cookie);
                    let userToken = jwt.decode(cook.jwt);

                   //later i have to write code for managing user chat history
                   // now simply sending message to users friend
                    if(socketUsers[m.friendName]){
                        // users friend wll receive mesage
                        io.sockets.socket(socketUsers[userToken.username]).emit('receive-message',{
                            message:m.message,
                            friendName:userToken.username
                        });
                    }
                   }
                   
              })
          
          });
          
    }
}

module.exports.getSocket = socketHandling.getSocket;