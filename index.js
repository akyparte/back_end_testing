const express = require('express');
const login_system_route = require('./Routers/login_system_routes');
const forgot_route = require('./Routers/forgot_password_routes');
const clsTokenValidation = require('./middlewareFiles/validateToken');
const objTokenValidation = new clsTokenValidation();
const cookieParser = require('cookie-parser');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const res = require('express/lib/response');
const io = new Server(server);


app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static(__dirname+'/public'));


app.get('/', objTokenValidation.varifyToken,(req, res) => {
  res.sendFile(__dirname + '/staticPages/sign_up_in_page.html');

});

app.use('/',login_system_route);

app.use('/forgot_password',forgot_route);

app.get('/chat',objTokenValidation.isTokenExisted,(req,res) => {
    // now i 'll get jwt from cookie take username from it
    // make request to database get his info 
    // and create his page dynamically
    res.json({chat:'hhhoommmmee'});
})


app.get('*',(req,res) => {
     res.sendStatus(404);
})
io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(4000,() => {
  console.log('listening on *:4000');
});



function isValidUser(req,res,next) {
     
}