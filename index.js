/* global __dirname */
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  //res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/index.html');
});

var onlineList = ['admin'];

io.on('connection', function(socket){
  console.log('a user connected: ' + socket.client.id);
  socket.nickname = "user_" + socket.client.id;
  
  // When user logs on, add name to online list
  // Also save user to onlineList array
  //io.emit('user online', "user_" + socket.client.id);
  onlineList.push(socket.nickname);
  io.emit('user online', onlineList);
  
  // When a user disconnects, remove them from online list
  socket.on('disconnect', function() {
    console.log('a user disconnected: ' + socket.nickname);

    io.emit('user left', socket.nickname);
    onlineList.splice(onlineList.indexOf(socket.nickname));
  });
  
  // When a user sends a chat message
  socket.on('chat msg', function(msg){
    // Emit the user's message using their nickname as sender
    io.emit('chat msg', {nickname:socket.nickname, msg:msg});
  });
  
  // When user sets their nickname, check if it exists.
  // If it does not, add to array.
  socket.on('set nickname', function(name){
    if(onlineList.indexOf(name) == -1) {
      onlineList.splice(onlineList.indexOf(socket.nickname), 1);
      socket.nickname = name;
      onlineList.push(name);
      
      // Change the online list to reflect nickname change
      //io.emit('update user', {id:"user_" + socket.client.id, name:name});
      io.emit('update user', onlineList);
    }
    else {
      // Tell user it exists
    }
  });
  
  socket.on('user typed', function(state) {
    if (state == true) {
      io.emit('user typing', socket.nickname);  
    }
    else {
      io.emit('user not typing', socket.nickname); 
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});