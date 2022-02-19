const {Op} = require('sequelize');
const generateID = require('generate-unique-id');
const {Users} = require('./database');
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
}

module.exports = Queries;

// let uu = new Queries();

// uu.isRegisteredUser('akshay','dvddv','eeeee');

//  (async function() {
//     await Users.create({username:'akshay',password:'cscsc',email:'dcjbdcbdb'})
// })();