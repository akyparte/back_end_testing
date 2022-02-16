const {Op} = require('sequelize');
const {Users} = require('./database');

class Queries {
  
  async addUser(username,password,email) {
       let [result] = await Users.findOrCreate({
           where:{
               username:username,
           }
       });

       console.log(Users);
   }
}

let uu = new Queries();

uu.addUser('akshay');

//  (async function() {
//     await Users.create({username:'akshay',password:'cscsc',email:'dcjbdcbdb'})
// })();