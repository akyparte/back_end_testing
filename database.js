const config = require('./config');
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
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false,
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


(async function (params) {
    try{
       await sequelize.sync();
       console.log('table created');
    }catch{
        console.log('error occured');
    }
})();

module.exports.Users = Users;


