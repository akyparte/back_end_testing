const {Op} = require('sequelize');
const generateID = require('generate-unique-id');
const {Users,TempEmailStore,Friends,UserTimeStamp,Chats,UnreadChatCount,Sequelize} = require('./database');
const bcrypt = require('bcrypt');
const { use } = require('../Routers/login_system_routes');
let unReadChatCount = require('../unReadChats/unreadChatsCount');
const timespan = require('jsonwebtoken/lib/timespan');

class Queries {
  
  async addUser(username,password,email) {
      let user = await Users.findOne({
          where:{
              username:username,
          }
      });
      if(user){
        return { isCreated:false }       
      }else {
        let salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(password, salt);
        let ID = generateID({ length: 32});
          let result = await Users.create({
              username:username,
              password:hashedPassword,
              email:email,
            //   uniqueID:ID
          })
        
           return { data:result.dataValues, isCreated:true }       
      }
   }

   async isRegisteredUser(username,password){
       let user = await Users.findOne({
            where:{username:username}
        });
        if(user){
            if(user.dataValues.ISLOGGEDIN){
                return {
                    alreadyLoggedIn:true
                }
            }
            let valid = await bcrypt.compare(password,user.password);
            return {
                validUser:valid,
                user:user
            };
        }else {
            return { validUser:false  }
        }
  
   }

   async validateUserForOTP(username){
         let user = await Users.findOne({
             where:{
                 username:username
             }
         });
         if(user){
            let pp;
             let OTP = this.generate();
             try{
                 pp = await TempEmailStore.update(
                 { OTP:Number(OTP) },
                 {  where:{ email:user.email } }
                 );
            }catch(err){
                console.log(err);
            }
            if(pp[0]){
                return {
                    userExists:true,
                    isOTPGenerated:true,
                    userData:user.dataValues,
                    OTP:OTP
                 }
            }else {
                let userEmail = await TempEmailStore.create({
                    email:user.email,
                    OTP:OTP
                });
   
                return {
                   userExists:true,
                   isOTPGenerated:true,
                   userData:user.dataValues,
                   OTP:OTP
                }
            }
            
         }else {
             return {
                 userExists:false,
                 isOTPGenerated:false
             }
         }
   }

    generate() { return Math.round(11111+Math.random()*99999); }

    async validateOTP(username,OTP){
         let user = await Users.findOne({
             where:{username:username}
         })
         if(user){
             let userEmail = await TempEmailStore.findOne({
                  where:{ email:user.email }
             });
             if(userEmail.OTP === OTP){
                 return {
                     isOTPValidated:true
                 }
             }else {
                 return {
                     isOTPValidated:false
                 }
             }
         }
    }

    async saveNewPassword(username,password){
        let salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(password, salt);

        let user = await Users.update(
            { password:hashedPassword },
            {where:{username:username}}
        );

        if(user[0]){
            return {  passChanged:true  }
        }else {
            return {  passChanged:false  }
           
        }

    }

    async getUserFriends(username){
          let result = await Friends.findAll({
              where:{
                  username:username
              }
          });

          return result;
    }


    async saveUsersTimeStamp(username,time){
         let result = await UserTimeStamp.findOne({
             where:{username:username}
         });
          if(result){
              result = await UserTimeStamp.update({
                  status:time
              },{
                  where:{
                      username:username
                  }
              });

              if(result[0]){
                  return {updated:true}
              }else {
                  return{updated:false}
              }
          }else {
              result = await UserTimeStamp.create({
                  username:username,
                  status:time
              });

              return {
                  created:true
              }
          }
    }

    async getUsersTimeStamp(username){
        let result = await UserTimeStamp.findOne({
            where:{username:username}
        });

        if(result){
            return {result:result.dataValues}
        }else {
            return {notUsedEvenOnce:true}
        }
    }


    // async getChats(chatId,unreadChatCount){
    //     let limit;
    //     if(unreadChatCount>= 6){
    //         limit = unreadChatCount;
    //     }else limit = 6;

    //     let chatCount = await Chats.count({
    //         where:{
    //             chatId:chatId
    //         }
    //     })
         
    //     if(chatCount === 0){
    //         return {
    //             chatsAvailable:false
    //         }
    //     }else {
    //         let chats;
    //         if(chatCount <= 6){
    //             chats = await Chats.findAll({
    //                 where:{chatId:chatId},
    //                 offset:chatCount-limit
    //             })
    //             // limit = 0
    //         }else {
    //             chats = await Chats.findAll({
    //                 where:{chatId:chatId},
    //             })
    //         }
            
    //         chats = chats.map(obj => obj.dataValues);
    //         return {result:chats,chatsAvailable:true}
    //     }




    //     // if(chats.length){
    //     //     chats = chats.map(obj => obj.dataValues);
    //     //     return {result:chats,chatsAvailable:true}
    //     // }else {
    //     //     return {
    //     //         chatsAvailable:false
    //     //     }
    //     // }
    // }


    async getChats(chatId,unreadChatCount){
         // check if chats are available or not
        let chatCount = await Chats.count({
            where:{
                chatId:chatId
            }
        });
        let chats;
        if(chatCount === 0){
            return {
                chatsAvailable:false
            }
        }else if(chatCount <= 6){
            chats = await Chats.findAll({
                where:{chatId:chatId},
            })
            chats = chats.map(obj => obj.dataValues);
            return {result:chats,chatsAvailable:true}
        }else {
            let limit;
            if(unreadChatCount>= 6){
                 limit = unreadChatCount;
            }else limit = 6;

            chats = await Chats.findAll({
                where:{chatId:chatId},
                offset:chatCount-limit
            });

            chats = chats.map(obj => obj.dataValues);
            return {result:chats,chatsAvailable:true}
        }


    }

    async getChatHistory(chatId,chatCount){
        let totalChatCount = await Chats.count({
            where:{
                chatId:chatId
            }
        });
        if(totalChatCount === 0){
            return {chatsRemaining:false}
        }else if(totalChatCount === chatCount){
            return {chatsRemaining:false}
        }else if(totalChatCount < 6){
            let chats = await Chats.findAll({
                where:{chatId:chatId},
            });
            chats = chats.map(obj => obj.dataValues);
            return {result:chats,chatsRemaining:true}
        }else if(totalChatCount > chatCount){
            let limit = 6;
            // if(unreadChatCount>= 6){
            //      limit = unreadChatCount;
            // }else limit = 6;

            let chats = await Chats.findAll({
                where:{chatId:chatId},
                offset:totalChatCount-limit
            });

            chats = chats.map(obj => obj.dataValues);
            return {result:chats,chatsRemaining:true}
        }
    }
    async getUserWithProfileAndStatus(username){
        // this function finds user and returns his name and profile
        // because in front-end when user search for a friend, request comes here

        
        let user = await Users.findOne({
            where:{username:username}
        })
        if(user){
            let userTimeStamp = await this.getUsersTimeStamp(username);
            let userObj = {
                    username:user.dataValues.username,
                    profileUrl:user.dataValues.profileUrl,
                    userExists:true,
            };

            if(!userTimeStamp.notUsedEvenOnce){
                userObj.timeStamp = userTimeStamp.result;
            }else {
                userObj.timeStamp = 'New User';
            }
            return userObj;
        }else {
            return {userExists:false}
        }
      
      }
      
    async isAlreadyFriend(username,friendName){
          
          let result = await Friends.findOne({
              where:{username:username,friend:friendName}
          });
          if(result){
              return { alreadyFriend:true }
          }else {
              return { alreadyFriend:false}
          }
    }  
      
    async saveNewFriend(username,friendName,profileUrl,needUsersInfo){
      
        // now need to get user's info because we have to add this user in his friend's list
        let userNameToAddInFriendTable;
        let userProfileSrcToAddInFriendTable;
      
      
        let userInfo = await Users.findOne({
           where:{username:username}
         });
        if(userInfo){
            userNameToAddInFriendTable = userInfo.dataValues.username;
            userProfileSrcToAddInFriendTable = userInfo.dataValues.profileUrl;
            
               let chatId = generateID({ length: 32});
                   let finalResult = {};
                   let result = await Friends.bulkCreate([{
                             username:username,
                             friend:friendName,
                             profileUrl:profileUrl,
                             chatId:chatId
                          },
                       {
                          username:friendName,
                          friend: userNameToAddInFriendTable,
                          profileUrl:userProfileSrcToAddInFriendTable,
                          chatId:chatId
                     }]);
                   if(result.length){
                       
                    if(needUsersInfo){
                        finalResult.usersData = {
                            user:userNameToAddInFriendTable,
                            pro:userProfileSrcToAddInFriendTable,
                            chatId:chatId
                        };
                    }else {
                        finalResult.chatId = chatId;
                    }
                    finalResult.friendAdded = true;

                    return finalResult;

                    }else {
                      finalResult.friendAdded = false;
                  }
         }
      
          
    }

    async saveChats(chatId,messageObj){
        let messageObjArrayWithChatId = messageObj.map(obj =>{  
             obj.chatId = chatId;
            return obj  
        })
            let result = await Chats.bulkCreate(messageObjArrayWithChatId);

         if(result){
            return {saved:true}
         }else {
             return {saved:false}
         }
    }

    async saveChatCount(username,friend,count){
            let result = await UnreadChatCount.findOne({
                where:{
                    username:username,
                    friend:friend
                }
            });

             let updated = await UnreadChatCount.update({
                 chatCount:result.dataValues.chatCount + count
             },{
                 where:{
                     username:username,
                     friend:friend
                 }
             });

             if(updated[0]){
                 return true;
             }else {
                 return false;
             }
         
    }

    async createUserForChatCount(username,friend){
          let created = await UnreadChatCount.bulkCreate([{
              username:username,
              friend:friend,
              chatCount:0
          },{
              username:friend,
              friend:username,
              chatCount:0  
          }]);
          if(created){
              return true;
          }else {
              return false;
          }
    }

    async resetChatCount(username,friend){
          let result = await UnreadChatCount.update({
              chatCount:0
          },{
              where:{
                  username:username,
                  friend:friend
              }
          });

          if(result) return true;
          else return false;

    }


    async getUnreadChatCount(username,friend){
        let chatCount = 0;
        // if(unReadChatCount[username] && unReadChatCount[username][friend]){
        //     chatCount = unReadChatCount[username][friend];
        // }
        if(unReadChatCount[username] && unReadChatCount[username][friend]){
            chatCount = unReadChatCount[username][friend];
        }
            let result = await UnreadChatCount.findOne({
                where:{
                    username:username,
                    friend:friend
                }
            });
            if(result){
                return result.dataValues.chatCount+chatCount;
            }else {
                return chatCount;
            }
    }
    
    async makeUserLoggedIIN(username){
         
        let result = await Users.update({
            ISLOGGEDIN:1
        },
        {
            where:{username:username}
        });
        if(result[0]) return true;
        else return false;
    }


    async getRemainingChats(chatId,chatLength){
          
        let result = Chats.findAll({
            where:{chatId:chatId}
        });

        if(result){
            
        }
    }
}

module.exports = Queries;

// let uu = new Queries();

// uu.isRegisteredUser('akshay','dvddv','eeeee');

//  (async function() {
//     await Users.create({username:'akshay',password:'cscsc',email:'dcjbdcbdb'})
// })();