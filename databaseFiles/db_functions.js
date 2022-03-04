const {Op} = require('sequelize');
const generateID = require('generate-unique-id');
const {Users,TempEmailStore,Friends,UserTimeStamp,Chats} = require('./database');
const bcrypt = require('bcrypt');
const { use } = require('../Routers/login_system_routes');

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
              uniqueID:ID
          })
        
           return { data:result.dataValues, isCreated:true }       
      }
   }

   async isRegisteredUser(username,password){
       let user = await Users.findOne({
            where:{username:username}
        });
        if(user){

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


    async getChats(username,friendName){
       
        let result = await Chats.findAll({
            where:{
                username:username,
                friendName:friendName
            }
        })

        if(result.length){
            return {result:result.dataValues,chatsAvailable:true}
        }else {
            return {
                chatsAvailable:false
            }
        }
    }

    async getUserWithProfile(username){
        // this function finds user and returns his name and profile
        // because in front-end when user search for a friend, request comes here


        let user = await Users.findOne({
           where:{username:username}
        })
        if(user){
           return {
                 username:user.dataValues.username,
                 profileSrc:user.dataValues.profileSrc,
                 userExists:true
                  }
        }else {
            return {userExists:false}
        }
      
      }
      
      
    async saveNewFriend(username,friendName,profileSrc){
      
        // now need to get user's info because we have to add this user in his friend's list
        let userNameToAddInFriendTable;
        let userProfileSrcToAddInFriendTable;
      
      
        let userinfo = await User.findOne({
           where:{username:username}
         });
        if(userinfo){
            userNameToAddInFriendTable = userInfo.dataValues.username;
            userProfileSrcToAddInFriendTable = userInfo.dataValues.profileSrc;
         }
      
        let previousChatId = await Friends.findOne({
           where:{username:username,friendName:friendName}
        });
      
       let chatId;
       if(previousChatId){
          chatId = previousChatId.dataValues.chatId+1;
        }
      
         if(previousChatId.dataValues.chatId){
           let finalResult = {};
           let result = await Friends.bulkCreate({
                     username:username,
                     friend:friendName,
                     profileSrc:profileSrc,
                     chatId:chatId
                  },
               {
                  username:friendName,
                  friend: userNameToAddInFriendTable,
                  profileSrc:userProfileSrcToAddInFriendTable,
                  chatId:chatId
             })
           if(result){
              finalResult.friendAdded = true;
                 // because we want time stamp of friend not that actice user
                 let friendtimeStamp = await timeStamp.findOne({
                     where:{username:friendName}
                 })
                 if(friendtimeStamp){
                    finalResult.timeStamp = friendtimeStamp.dataValues.status;
                    return finalResult;
                 }else {
                    // means user exist but never used chatting website 
                    // so return new user
                    finalResult.timeStamp = 'New User';
                     return finalResult;
                 }
            }else {
              finalResult.friendAdded = false;
          }
        }
      
          
    }


    

}

module.exports = Queries;

// let uu = new Queries();

// uu.isRegisteredUser('akshay','dvddv','eeeee');

//  (async function() {
//     await Users.create({username:'akshay',password:'cscsc',email:'dcjbdcbdb'})
// })();