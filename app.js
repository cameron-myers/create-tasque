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

var CONNECT_LIST = {};
var PLAYER_LIST = {};
var BULLET_LIST = {};
var gameStart = false;
var clickNum = 0;
var Player = function(id){
    if(id == 0){
        var self = {
            x:50,
            y:150,
            id:id,
            number:1,
            pressingUp:false,
            pressingDown:false,
            pressingLeft:false,
            pressingRight:false,
            maxSpd:4,
        }
        self.updatePosition = function(){
            if(self.pressingUp)
                self.y -= self.maxSpd;
            if(self.pressingDown)
                self.y += self.maxSpd;
            if(self.pressingLeft)
                self.x -= self.maxSpd;
            if(self.pressingRight)
                self.x += self.maxSpd;
            
            if(self.x >= 850){
                    //move back by max spd
                    self.x -= self.maxSpd;
                  }
                  else if(self.x <= 0){
                    self.x += self.maxSpd;
                  }
                  else if(self.y >= 450){
                    //move back by max spd
                    self.y -= self.maxSpd;
                  }
                  else if(self.y <= 0){
                    self.y += self.maxSpd;
                      
                  }
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
            pressingLeft:false,
            pressingRight:false,
            maxSpd:4,
        }
        self.updatePosition = function(){
            if(self.pressingUp)
                self.y -= self.maxSpd;
            if(self.pressingDown)
                self.y += self.maxSpd;
            if(self.pressingLeft)
                self.x -= self.maxSpd;
            if(self.pressingRight)
                self.x += self.maxSpd;

            //map boundry collision
                if(self.x >= 850){
                    //move back by max spd
                    self.x -= self.maxSpd;
                  }
                  else if(self.x <= 0){
                    self.x += self.maxSpd;
                  }
                  else if(self.y >= 450){
                    //move back by max spd
                    self.y -= self.maxSpd;
                  }
                  else if(self.y <= 0){
                    self.y += self.maxSpd;
                      
                  }
        }
    }

    return self;
}

var Bullet = function(x, y, mouseX, mouseY, id){
    var self = {
        x:x,
        y:y,
        spdX:10,
        spdY:10,
        mouseX:mouseX,
        mouseY:mouseY,
        id:id,
        
    }
   
  //TODO:CHANGE BULLET UPDATE BASED ON MOUSE POINTER LOCATION  
    self.updatePosition = function(){

        self.x += self.spdX;
        self.y += self.spdY;

          if(self.x >= 850 || self.x <= 0){
            delete BULLET_LIST[id];
          }
          else if(self.y >= 450|| self.y <= 0){
            delete BULLET_LIST[id];
          }

         //TODO figure out how to get player position info into ball for collision detection

         }
      BULLET_LIST[self.id] = self;

    return self;
}

var io = require('socket.io') (serv, {});
//what to do on connection
io.sockets.on('connection', function(socket){
    //add a random number to a list of connected "sockets"
    socket.id = conNum;
    CONNECT_LIST[socket.id] = socket;
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
        delete CONNECT_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });
//user input registering
    socket.on('keypress', function(data){
        if(data.inputId === 'up')
            player.pressingUp = data.state;
        else if (data.inputId === 'down')
            player.pressingDown = data.state;
        else if (data.inputId === 'left')
            player.pressingLeft = data.state;
        else if (data.inputId === 'right')
            player.pressingRight = data.state;
            
    });
    //receive shoot command and create bullet entity
    socket.on('click', function(data){
        clickNum++;
        
        var bullet = Bullet(player.x, player.y, data.x, data.y, clickNum);
        console.log(data.x + ' ' + data.y);
        bullet.updatePosition();
    })
});




//loop for player positions
setInterval (function() {
    var playerPack = [];
    var bulletPack = [];
    if(gameStart){
    for(var i in PLAYER_LIST) {
        var player = PLAYER_LIST[i];     
        player.updatePosition();
        playerPack.push({
            x:player.x,
            y:player.y,
            number:player.number,

        })
    }
    for (var i in BULLET_LIST) {
        var bullet = BULLET_LIST[i];
        bullet.updatePosition();
        bulletPack.push({
            x:bullet.x,
            y:bullet.y,
            id:i
        })
    }
    //sends packets using socket id
    for(var i in CONNECT_LIST) {
        var socket = CONNECT_LIST[i];
    socket.emit('newPositions',playerPack, bulletPack);
    }
    }
}, 250/25);