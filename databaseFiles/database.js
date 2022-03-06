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
})();



let Users = sequelize.define('Users',{
    username:{
        type:DataTypes.STRING(25),
        allowNull:false,
    },
    email:{
        type:DataTypes.STRING(30),
        allowNull:false,
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    uniqueID:{
        type:DataTypes.STRING,
        allowNull:false
    },
    profileUrl:{
        type:DataTypes.STRING(600)
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
        type:DataTypes.STRING(25),
        allowNull:false
    },
    profileUrl:{
        type:DataTypes.STRING(500),
        allowNull:false
    },

},{
    timestamps:false,
    indexes:[
        {
            unique: true,
            fields: ['username','friend']
          }
    ],
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


let UserTimeStamp = sequelize.define('userTime',{
    username:{
        type:DataTypes.STRING(25),
        allowNull:false
    },
    status:{
        type:DataTypes.STRING,
        allowNull:false
    }
},
{
    timestamps:false
});


let Chats = sequelize.define('chats',{
    username:{
        type:DataTypes.STRING,
        allowNull:false
    },
    friendName:{
        type:DataTypes.STRING,
        allowNull:false
    },
},{
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
module.exports.UserTimeStamp = UserTimeStamp;
module.exports.Chats = Chats;

