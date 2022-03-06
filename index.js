const express = require('express');
const login_system_route = require('./Routers/login_system_routes');
const forgot_route = require('./Routers/forgot_password_routes');
const clsTokenValidation = require('./middlewareFiles/validateToken');
let search_user_route = require('./Routers/search_user_routes');
let socket_route = require('./socket_management/sockets');
const objTokenValidation = new clsTokenValidation();
const chat_router = require('./Routers/chat_home_routes');
const cookieParser = require('cookie-parser');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const cls_db_functions = require('./databaseFiles/db_functions');
const objDbFunctions = new cls_db_functions();





app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static(__dirname+'/public'));
app.use(express.static(__dirname+'/profile_images'))

socket_route.getSocket(io);

app.get('/', objTokenValidation.varifyToken,(req, res) => {
  res.sendFile(__dirname + '/staticPages/sign_up_in_page.html');

});

app.use('/',login_system_route);

app.use('/forgot_password',objTokenValidation.isTokenExisted,forgot_route);

app.use('/chat',objTokenValidation.isTokenExisted,chat_router);

app.use('/search',objTokenValidation.isTokenExisted,search_user_route);


app.get('*',(req,res) => {
     res.sendStatus(404);
})



server.listen(8000,'192.168.0.105',() => {
  console.log('listening on *:8000');
});
