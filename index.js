const express = require('express');
const fileParser = require('express-multipart-file-parser')
const multer = require('multer');
const login_system_route = require('./Routers/login_system_routes');
const forgot_route = require('./Routers/forgot_password_routes');
const user_profile_route = require('./Routers/profile_routes');
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
const jwt = require('jsonwebtoken');
const { userInfo } = require('os');





app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static(__dirname+'/public'));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname+'/profile_images')
  },
  filename: function (req, file, cb) {
    console.log(file);
    if(req.cookies && req.cookies.jwt){
       var userInfo = jwt.decode(req.cookies.jwt);
    }
    cb(null, userInfo.username + '.'+file.originalname)
  }
})
 
var upload = multer({ storage: storage })
let uploadFields = upload.fields([{name:'userProfile',maxCount:1}])
app.use(uploadFields);

socket_route.getSocket(io);

app.get('/', objTokenValidation.varifyToken,(req, res) => {
  res.sendFile(__dirname + '/staticPages/sign_up_in_page.html'); 
});
app.use('/profile_images',objTokenValidation.isTokenExisted,express.static(__dirname+'/profile_images'))

app.use('/',login_system_route);

app.use('/forgot_password',forgot_route);

app.use('/chat',objTokenValidation.isTokenExisted,chat_router);

app.use('/search',objTokenValidation.isTokenExisted,search_user_route);

app.use('/user_profile',objTokenValidation.isTokenExisted,user_profile_route);


app.get('*',(req,res) => {
     res.sendStatus(404);
})



server.listen(8000,'192.168.0.105',() => {
  console.log('listening on *:8000');
});
