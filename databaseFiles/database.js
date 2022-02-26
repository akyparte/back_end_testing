const config = require('../config');
const { Sequelize , DataTypes } = require('sequelize');
const sequelize = new Sequelize(config.database,config.username,config.password,{
    host:config.host,
    dialect:config.dialect,
});

(async function() {
    try{
       await sequelize.authenticate();
       console.log('connection has been established');
    }catch{
       console.log('error occured');
    }
})()



let Users = sequelize.define('Users',{
    username:{
        type:DataTypes.STRING(25),
        allowNull:false,
    },
    email:{
        type:DataTypes.STRING(30),
        allowNull:false,
        unique:true
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    uniqueID:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{
    indexes:[
        {
            unique: true,
            fields: ['username']
          }
    ],
    timestamps:false

});

let Friends = sequelize.define('Friends',{
    username:{
        type:DataTypes.STRING(25),
        allowNull:false,
    },
    friend:{
        type:DataTypes.STRING(25)
    }

},{
    indexes:[
        {
            unique: true,
            fields: ['username']
          }
    ],
    timestamps:false

});

let TempEmailStore = sequelize.define('emailStore',{
    email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    OTP:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{
    indexes:[
        {
            unique:true,
            fields:['email']
        }
    ],
    timestamps:false
});

(async function () {
    try{
       await sequelize.sync();
       console.log('table created');
    }catch(err){
        console.log(err);
        console.log('error occured');
    }
})();

module.exports.Users = Users;
module.exports.TempEmailStore = TempEmailStore;
module.exports.Friends = Friends;

