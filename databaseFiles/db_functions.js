const {Op} = require('sequelize');
const generateID = require('generate-unique-id');
const {Users} = require('./database');
const bcrypt = require('bcrypt');

class Queries {
  
  async addUser(username,password,email) {
      let salt = await bcrypt.genSalt(10);
     let hashedPassword = await bcrypt.hash(password, salt);
     let ID = generateID({ length: 32});
       let [result,isCreated] = await Users.findOrCreate({
           where:{
               username:username,
               email:email,
               password:hashedPassword,
               uniqueID:ID
           }
       });
       return { data:result.dataValues, isCreated:isCreated }       
   }

   async isRegisteredUser(username,password){
       let user = await Users.findOne({
            where:{username:username}
        });
       let valid = await bcrypt.compare(password,user.password);
    //    console.log(s
       return {
           validUser:valid,
           user:user
       };
   }
}

module.exports = Queries;

// let uu = new Queries();

// uu.isRegisteredUser('akshay','dvddv','eeeee');

//  (async function() {
//     await Users.create({username:'akshay',password:'cscsc',email:'dcjbdcbdb'})
// })();