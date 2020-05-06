var express = require('express');
var app = express();
var serv = require('http').Server(app);
var conNum = 0;
app.get('/',function(req,res){
    res.sendFile(__dirname + "/client/index.html");

});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server Started");

var SOCKET_LIST = {};
var PLAYER_LIST = {};
var BALL = {};
var gameStart = false;
var Player = function(id){
    if(id == 0){
        var self = {
            x:50,
            y:150,
            id:id,
            number:1,
            pressingUp:false,
            pressingDown:false,
            maxSpd:4,
        }
        self.updatePosition = function(){
            if(self.pressingUp)
                self.y -= self.maxSpd;
            if(self.pressingDown)
                self.y += self.maxSpd;
        }
    }
    else if (id == 1){
        var self = {
            x:750,
            y:150,
            id:id,
            number:2,
            pressingUp:false,
            pressingDown:false,
            maxSpd:4,
        }
        self.updatePosition = function(){
            if(self.pressingUp)
                self.y -= self.maxSpd;
            if(self.pressingDown)
                self.y += self.maxSpd;
        }
    }

    return self;
}

var Ball = function(){
    var self = {
        x:450,
        y:250,
        spdX:3,
        spdY:1,
        id:'ball',
    }
    
    self.updatePosition = function(){
        self.x += self.spdX;
        self.y += self.spdY;

          if(self.x >= 850 || self.x <= 0){
            self.spdX *= -1;
          }
          else if(self.y >= 450|| self.y <= 0){
            self.spdY *= -1;
          }
         //TODO figure out how to get player position info into ball for collision detection

         }
      

    return self;
}

var io = require('socket.io') (serv, {});
//what to do on connection
io.sockets.on('connection', function(socket){
    //add a random number to a list of connected "sockets"
    socket.id = conNum;
    SOCKET_LIST[socket.id] = socket;
    console.log('socket connection' + conNum);
    
//add id to list of "players"
    if(conNum <= 1){
        var player = Player(socket.id);
        PLAYER_LIST[socket.id] = player;
        console.log('player connection');
    }
    else{
        socket.emit('spectate');
    }
    //when player 2 joins, start ball movement
    if(conNum >= 1){
        gameStart = true;
        var ball = Ball();
        BALL[0] = ball;
        socket.emit('gameBegin');
    }
    else {
        socket.emit('pregame');
    }
    conNum++;
//what to do on disconnect from server
    socket.on('disconnect', function(){
        conNum--;
        console.log("socket disconnected");
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });
//user input registering
    socket.on('keypress', function(data){
        if(data.inputId === 'up')
            player.pressingUp = data.state;
        else if (data.inputId === 'down')
            player.pressingDown = data.state;
    });
});




//loop for player positions
setInterval (function() {
    var pack = [];
    if(gameStart){
    for(var i in PLAYER_LIST) {
        var player = PLAYER_LIST[i];
        var ball = BALL[0];
        ball.updatePosition();        
        player.updatePosition();
        pack.push({
            x:player.x,
            y:player.y,
            number:player.number,
            ballx:ball.x,
            bally:ball.y,
        })
    }
    //sends packets using socket id
    for(var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
    socket.emit('newPositions',pack);
    }
    }
}, 250/25);