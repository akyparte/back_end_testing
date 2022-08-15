const cookie = require('cookie');
const socketUsers = require('../DATA_SPACE/online_users');
const jwt = require('jsonwebtoken');
const config = require('../config');
const cls_db_functions = require('../databaseFiles/db_functions');
const objDbFunctions = new cls_db_functions();
let chatsArray = require('../chats/chats_array');
let activeFriends = require('../usersActiveFriends/activeFriends');
let unReadChatCount = require('../unReadChats/unreadChatsCount');
let socketHolder;


class socketHandling {
    static getSocket(io) {
        socketHolder = io;
        io.on('connection', async(socket) => {
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
                    
                    if(activeFriends[userToken.username]){
                        let friendsList = Object.keys(activeFriends[userToken.username]);
                        for(let i = 0;i < friendsList.length;i++){
                              if(socketUsers[friendsList[i]]){
                                io.to(socketUsers[friendsList[i]]).emit('update-users-status',userToken.username,socket.handshake.time);
                              }
                        }
                    }
                    await socketHandling.userDisconnectedSaveChats(userToken.username);
                    // await socketHandling.userDisconnectedSaveUnreadChatCount(userToken.username);
                  }
              });
 
              // from user we will receive message to send his friend
              socket.on('send-message',async (m) => {
                   if(socket.handshake.headers.cookie){
                    // note -> from cookie we get the username , so that user wants to send message to his 
                    // friend , on that basis make a logic   
                    let cook =  cookie.parse(socket.handshake.headers.cookie);
                    let userToken = jwt.decode(cook.jwt);

                    // now i'll get to know if user's friend is talking with this user or not
                    let users_friends_friend_list = activeFriends[m.friendName];
                    
                    if(socketUsers[m.friendName]){
                        if(users_friends_friend_list.hasOwnProperty(userToken.username)){
                            if(users_friends_friend_list[userToken.username] === 1){
                                // send message because that user is actice
                                   io.to(socketUsers[m.friendName]).emit('receive-message',m.message,m.timeStamp);
                                    // io.sockets.socket(socketUsers[m.friendName]).emit('receive-message',{
                                    //     message:m.message,
                                    //     friendName:userToken.username
                                    // });
                                    await socketHandling.manageChats(m,userToken.username);
                            }else {
                                // send message count to client
                                io.to(socketUsers[m.friendName]).emit('unread-message-count',userToken.username,m.timeStamp);
                                await socketHandling.manageUnreadChats(userToken.username,m.friendName)
                                await socketHandling.manageChats(m,userToken.username);
                            }
                        }
                    }else {
                        await socketHandling.manageChats(m,userToken.username);
                        await socketHandling.manageUnreadChats(userToken.username,m.friendName);
                    }

                   //later i have to write code for managing user chat history
                   // now simply sending message to users friend
                   } 

                   console.log(activeFriends);
              })

                // from client event will be triggred to make one friend active
              socket.on('update-users-friends',(m) => {
                if(socket.handshake.headers.cookie){
                    let cook =  cookie.parse(socket.handshake.headers.cookie);
                    let userToken = jwt.decode(cook.jwt);
                    let usersFriends = activeFriends[userToken.username];
                    
                    if(usersFriends.hasOwnProperty(m.activeFriend)){
                        usersFriends[m.activeFriend] = 1;
                    }
                    if(usersFriends.hasOwnProperty(m.inActiveFriend)){
                        usersFriends[m.inActiveFriend] = 0;
                    }
                }

                console.log(activeFriends);
              });

              let usersFriends = await objDbFunctions.getUserFriends(user.username);

              socket.on('new-friend-addded',(friend) => {
                let cook =  cookie.parse(socket.handshake.headers.cookie);
                let user = jwt.decode(cook.jwt);
                

              })
              for(let i = 0;i < usersFriends.length;i++){
                  if(socketUsers[usersFriends[i].dataValues.friend]){
                    io.to(socketUsers[usersFriends[i].dataValues.friend]).emit('friend-connect',user.username);
                  }
              }
          });


          
    }

    static async manageChats(m,username,forceSave){
        // forceSave -> means user has selected another friends so save this users chat in database
        // username carries whos message it is 
        // means this user is sending message to his friend
         if(!chatsArray[m.chatId]){
             chatsArray[m.chatId] = [{user:username,message:m.message,timeStamp:m.timeStamp}];
         }else {
             chatsArray[m.chatId].push({user:username,message:m.message,timeStamp:m.timeStamp})
             if(chatsArray[m.chatId].length >= 5){
                let result = await objDbFunctions.saveChats(m.chatId,chatsArray[m.chatId]);
                if(result.saved){
                    chatsArray[m.chatId] = [];
                }
             }

            console.log(chatsArray);

         }
    }

    static async manageUnreadChats(username,friend){
        // username -> he is actually friend but here terminology is different 
        // means here in friend's website our user is his friend so now we are keeping track of our user's chat
        // count in friends website

        if(unReadChatCount[friend]){
             if(unReadChatCount[friend][username]){
                unReadChatCount[friend][username] = unReadChatCount[friend][username] + 1;
                // if(unReadChatCount[friend][username] >= 10){
                //       await objDbFunctions.saveChatCount(friend,username,unReadChatCount[friend][username]);
                //       unReadChatCount[friend][username] = 0;
                // }
             }else {
                unReadChatCount[friend][username] = 1;
             }
        }else {
            unReadChatCount[friend] = {
                [username]:1
            }
        }
    }

    static async userDisconnectedSaveChats(username){
         let userFriends = await objDbFunctions.getUserFriends(username);
         if(userFriends.length){
              for(let i = 0;i < userFriends.length;i++){
                   let chatId = userFriends[i].dataValues.chatId;
                   if(chatsArray[chatId]){
                       if(chatsArray[chatId].length){
                           await objDbFunctions.saveChats(chatId,chatsArray[chatId]);
                           chatsArray[chatId] = [];
                       }
                   }
              }
         }
    }
   
    // static async userDisconnectedSaveUnreadChatCount(username){
    //      console.log(unReadChatCount);
    //     let friends = await objDbFunctions.getUserFriends(username);

    //     for(let i = 0;i < friends.length;i++){
    //         let friend = friends[i].dataValues.friend;
    //         if(unReadChatCount[username] && unReadChatCount[username][friend]){
    //             await objDbFunctions.saveChatCount(username,friend,unReadChatCount[username][friend]);
    //             unReadChatCount[username][friend] = 0;
    //        }

    //     }
    //     console.log('chat count is saved into database');
    // }

    static getSocketToRoutes(){ return socketHolder; }
}

module.exports.getSocket = socketHandling.getSocket;
module.exports.getSocketToRoutes = socketHandling.getSocketToRoutes;