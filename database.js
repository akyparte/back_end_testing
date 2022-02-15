const config = require('./config');
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(config.database,config.username,config.password,{
    host:config.host,
    dialect:config.dialect,
});

sequelize.authenticate().then(() => {
    console.log('connection has been established');
}).catch((err) => {
    console.log(err);
})
