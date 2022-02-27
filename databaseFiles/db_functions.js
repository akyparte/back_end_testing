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
}

module.exports = Queries;

// let uu = new Queries();

// uu.isRegisteredUser('akshay','dvddv','eeeee');

//  (async function() {
//     await Users.create({username:'akshay',password:'cscsc',email:'dcjbdcbdb'})
// })();