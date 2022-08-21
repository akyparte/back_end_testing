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
        type:DataTypes.STRING(30),
        allowNull:false,
    },
    email:{
        type:DataTypes.STRING(40),
        allowNull:false,
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    // uniqueID:{
    //     type:DataTypes.STRING,
    //     allowNull:false
    // },
    profileUrl:{
        type:DataTypes.STRING(100),
        defaultValue:'default_profile.png'
    },
    ISLOGGEDIN:{
        type:DataTypes.INTEGER(1),
        defaultValue:0
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
Users.removeAttribute('id');

let Friends = sequelize.define('Friends',{
    username:{
        type:DataTypes.STRING(30),
        allowNull:false,
    },
    friend:{
        type:DataTypes.STRING(30),
        allowNull:false
    },
    profileUrl:{
        type:DataTypes.STRING(100),
        allowNull:false
    },
    chatId:{
        type:DataTypes.STRING(40),
        allowNull:false
    }

},{
    timestamps:false,
    indexes:[
        {
            unique: true,
            fields: ['username','friend']
          }
    ],
});

Friends.removeAttribute('id');
let TempEmailStore = sequelize.define('emailStore',{
    email:{
        type:DataTypes.STRING(40),
        allowNull:false
    },
    OTP:{
        type:DataTypes.STRING(6),
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
        type:DataTypes.STRING(30),
        allowNull:false
    },
    status:{
        type:DataTypes.STRING(70),
        allowNull:false
    }
},
{
    timestamps:false
});

UserTimeStamp.removeAttribute('id');


let Chats = sequelize.define('chats',{
    chatId:{
        type:DataTypes.STRING(40),
        allowNull:false
    },
    user:{
        type:DataTypes.STRING(30),
        allowNull:false
    },
    message:{
        type:DataTypes.STRING(600),
        allowNull:false
    },
    timeStamp:{ 
        type:DataTypes.STRING(70),
        allowNull:false
    },
},{
    indexes:[
        {
            fields: ['chatId']
          }
    ],
    timestamps:false,
});

Chats.removeAttribute('id');

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
module.exports.Sequelize = Sequelize;

