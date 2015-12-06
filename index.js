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
  
  // When user logs on, add name to online list
  // Also save user to onlineList array
  io.emit('user online', "user_" + socket.client.id);
  
  // When a user disconnects, remove them from online list
  socket.on('disconnect', function() {
    console.log('a user disconnected: ' + socket.client.id);
    
    if (socket.nickname) {
      io.emit('user left', socket.nickname);
    }
    else {
      io.emit('user left', "user_" + socket.client.id);
    }
  });
  
  // When a user sends a chat message
  socket.on('chat msg', function(msg){
    // If the user has a nickname set, use that for the broadcast
    if (socket.nickname) {
      io.emit('chat msg', {nickname:socket.nickname, msg:msg});
    }
    else {
      io.emit('chat msg', {nickname:"user_" + socket.client.id, msg:msg});
    }
    
  });
  
  // When user sets their nickname, check if it exists.
  // If it does not, add to array.
  socket.on('set nickname', function(name){
    if(onlineList.indexOf(name) == -1) {
      socket.nickname = name;
      onlineList.push(name);
      
      // Change the online list to reflect nickname change
      io.emit('update user', {id:"user_" + socket.client.id, name:name});
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});