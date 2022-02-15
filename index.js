const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/page.html');

});

app.post('/signin',(req,res) => {
    let username = req.body.username;
    let password = req.body.password;
});

app.get('/signout',(req,res) => {
    // now delete token cookie from browser 
    // and redirect that person to login page
})

app.post('/signup',(req,res) => {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    // now i need a database function which can tell me if this user exists or not
    // if exists return already_available
    // otherwise created

})

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(4000,() => {
  console.log('listening on *:4000');
});