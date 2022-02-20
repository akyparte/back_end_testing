const {Op} = require('sequelize');
const generateID = require('generate-unique-id');
const {Users,TempEmailStore} = require('./database');
const bcrypt = require('bcrypt');

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
}

module.exports = Queries;

// let uu = new Queries();

// uu.isRegisteredUser('akshay','dvddv','eeeee');

//  (async function() {
//     await Users.create({username:'akshay',password:'cscsc',email:'dcjbdcbdb'})
// })();