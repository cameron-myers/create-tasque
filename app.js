var express = require('express');
var app = express();
var serv = require('http').Server(app);
var conNum = 0;
//tells server to look in directory for both server files and client files
app.get('/',function(req,res){
    res.sendFile(__dirname + "/client/index.html");

});
app.use('/client', express.static(__dirname + '/client'));
//listen to port 2000 for a conncetion from the client
serv.listen(2000);
console.log("Server Started");
//initialize lists for data to be shared throughout the program
var CONNECT_LIST = {};
var PLAYER_LIST = {};
var BULLET_LIST = {};
var ENTITY_LIST = {};
var SCORE = {};
var gameStart = false;
var clickNum = 0;

//player object that takes id as a parameter
var Player = function(id){
//check if id is for player 1, if so give starting position and other settings
    if(id == 0){
        var self = {
            x:50,
            y:100,
            width:20,
            height:50,
            id:id,
            number:1,
            pressingUp:false,
            pressingDown:false,
            pressingLeft:false,
            pressingRight:false,
            hits:0,
            maxSpd:2,
        }
        //updatePosition function for player 1 that controls movement and map collision
        self.updatePosition = function(){
            //checks for collison with entities such as the map
            //sets boolean collision variable based on return 
            var collision = isTouching(self);
            if(collision) console.log("collison detected player 1");

            //player movement based on client input
            //up
            if(self.pressingUp)
                self.y -= self.maxSpd;
            //down
            if(self.pressingDown)
                self.y += self.maxSpd;
            //left
            if(self.pressingLeft)
                self.x -= self.maxSpd;
            //right
            if(self.pressingRight)
                self.x += self.maxSpd;
            //check for collision with map border
            if(self.x >= 180){
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
        //at the end of every update check if player is being hit by a bullet
        self.isHit();
        }
        //function that checks if the player is hit and returns self
        self.isHit = function(){
            //checks collision for every bullet in program existence
            //if hit then delete bullet that collided with player
            //updates score
            for(var i in BULLET_LIST){
            var bullet = BULLET_LIST[i];
               if(bullet.x > self.x && bullet.x < self.x + self.width && bullet.y > self.y && bullet.y < self.y + self.height){
                delete BULLET_LIST[i];
                console.log('player 1 hit!');
                SCORE[0]++;
            }
         }
        }
        return self;
    }
    // same as player 1 but for player 2 different starting conditions
    else if (id == 1){
        var self = {
            x:750,
            y:300,
            width:20,
            height:50,
            id:id,
            number:2,
            pressingUp:false,
            pressingDown:false,
            pressingLeft:false,
            pressingRight:false,
            hits:0,
            maxSpd:2,
        }
        //see player 1 function
        self.updatePosition = function(){
            var collision = isTouching(self);
            if(collision) console.log("collison detected player 2");
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
                  else if(self.x <= 680){
                    self.x += self.maxSpd;
                  }
                  else if(self.y >= 450){
                    //move back by max spd
                    self.y -= self.maxSpd;
                  }
                  else if(self.y <= 0){
                    self.y += self.maxSpd;
                      
                  }
            //see player 1 comments
            self.isHit();
        }
        //see player 1 comments
        self.isHit = function(){
        
            for(var i in BULLET_LIST){
                var bullet = BULLET_LIST[i];
                if(bullet.x > self.x && bullet.x < self.x + self.width && bullet.y > self.y && bullet.y < self.y + self.height){
                    console.log('player 2 hit!');
                    delete BULLET_LIST[i];
                    SCORE[1]++;
        }
     }
    }
    return self;
}
}
//bullet object constructor
//takes player x and y, mouse x and y, id, and playerid 
var Bullet = function(x, y, mouseX, mouseY, id, playerid){
    var self = {
        x:x,
        y:y+10,
        mouseX:mouseX,
        mouseY:mouseY,
        id:id,
        playerid:playerid
        
    }
    //create varible player that grabs data from the player list
    var player = PLAYER_LIST[self.playerid];
    //changes spawn x and y so player doesn't shoot self
    if (self.playerid == 0){
        self.x += 23;
    }
    if (player.id == 1){
        self.x -= 23;
    }

    // if x distance is positive
    if(player.id == 0){
    
    var angle = Math.atan((mouseY - player.y)/(mouseX - player.x));
    //x
    var spdX = Math.cos(angle)*10;
    //y
    var spdY = Math.sin(angle)*10;
    }
    //if x distance is negative
    else {

    var angle = Math.atan((mouseY - player.y)/(mouseX - player.x));
    //x
    var spdX = Math.cos(angle)*-10;
    //y
    var spdY = Math.sin(angle)*-10;
}
    //bullet objects position update function
    self.updatePosition = function(){

        
        self.x += spdX;
        self.y += spdY;
        
    //check for collion with entities ex. map
    //if collision then delete bullet
    //also checks for map boundry collision
        var collision = isTouching(self);
        if(collision) delete BULLET_LIST[id];
          if(self.x >= 850 || self.x <= 0){
            delete BULLET_LIST[id];
          }
          else if(self.y >= 450|| self.y <= 0){
            delete BULLET_LIST[id];
          }

         //TODO figure out how to get player position info into ball for collision detection

         }
         //update bullet with self data
      BULLET_LIST[self.id] = self;

    return self;
}
//constructor for entity object
// mostly used for map objects right now
var Entity = function(id, x, y, w, h, name){

        var self = {
            x:x,
            y:y,
            id:id,
            width:w,
            height:h,
            name:name,
        }
        
        return self;
    }

//function that returns a boolean declaring wheter or not a player is colliding with an object
function isTouching(object){
    var colliding;
    
    for(var i in ENTITY_LIST){
        var entity = ENTITY_LIST[i];
        if(object.x > entity.x && object.x < entity.x + entity.width && object.y > entity.y && object.y < entity.y + entity.height){
            
            return true;
        }
        else {colliding = false;}
    }
    
    return colliding;
}


var io = require('socket.io') (serv, {});
//what to do on connection
io.sockets.on('connection', function(socket){
    //add a connection number to a list of connected "sockets"
    socket.id = conNum;
    CONNECT_LIST[socket.id] = socket;
    console.log('socket connection' + conNum);
    
//add id to list of "players"
    if(conNum <= 1){
        var player = Player(socket.id);
        PLAYER_LIST[socket.id] = player;
        console.log('player connection');
    }
    //if there are already 2 player connected the server will tell the client they are spectating
    else{
        socket.emit('spectate');
    }
    //when player 2 joins, start ball movement
    //start drawing map objects
    //sets gamestart to true and emits gameBegin message to client. resets score
    if(conNum >= 1){
        ENTITY_LIST[0] = Entity(0, 200, 100, 80, 80, 'wall2');
        ENTITY_LIST[1] = Entity(1, 200, 300, 80, 80, 'wall2');
        ENTITY_LIST[2] = Entity(2, 600, 100, 80, 80, 'wall2');
        ENTITY_LIST[3] = Entity(3, 600, 300, 80, 80, 'wall2');
        // ENTITY_LIST[4] = Entity(4, 550, 300, 20, 50, 'wall1');
    
        gameStart = true;
            SCORE[0] = 0;
            SCORE[1] = 0;
            socket.emit('gameBegin');

    }
    //emit pregame it other statements aren't true
    else {
        socket.emit('pregame');
    }
    //increment connectin number
    conNum++;
//what to do on disconnect from server
//delete player from the socket list and player list
    socket.on('disconnect', function(){
        conNum--;
        console.log("socket disconnected");
        delete CONNECT_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });
//user input registering
//receive user input data from clients
    socket.on('keypress', function(inputData){
        if(inputData.inputId === 'up')
            player.pressingUp = inputData.state;
        else if (inputData.inputId === 'down')
            player.pressingDown = inputData.state;
        else if (inputData.inputId === 'left')
            player.pressingLeft = inputData.state;
        else if (inputData.inputId === 'right')
            player.pressingRight = inputData.state;
            
    });
    //receive shoot command and create bullet entity
    socket.on('click', function(data){
        clickNum++;

        
        console.log(data.x + ' ' + data.y);
        if(player.id == 0 && data.x <= player.x) delete bullet;
        else if(player.id == 1 && data.x >= player.x) delete bullet;
        else{
            //calls bullet object and position update
            var bullet = Bullet(player.x, player.y, data.x, data.y, clickNum, player.id);
            bullet.updatePosition();
        }
    

    })
    
});




//loop for positions
//runs somewhere between 45-60 times per second
setInterval (function() {
    //create arrays to send data in
    var playerPack = [];
    var bulletPack = [];
    var mapPack = [];
    var scorePack = [];
    
    //sets score array with score data
    scorePack[0] = SCORE[1];
    scorePack[1] = SCORE[0];

    //only runs if gameStart equals true
    if(gameStart){
        //checks for winnings score and updates score to display winner and loser on scoreboard
        if(scorePack[0] >= 30) {scorePack[0] = 'WINNER!!!'; scorePack[1] = 'LOSER!!!';}
        if(scorePack[1] >= 30) {scorePack[1] = 'WINNER!!!'; scorePack[0] = 'LOSER!!!';}

        //for every player in the list update position and push x,y, and player number into the packet
    for(var i in PLAYER_LIST) {
        var player = PLAYER_LIST[i];     
        player.updatePosition();
        playerPack.push({
            x:player.x,
            y:player.y,
            number:player.number,

        })
    }

    //for every bullet in the list update position and push x,y, and id into the packet
    for (var i in BULLET_LIST) {
        var bullet = BULLET_LIST[i];
        bullet.updatePosition();
        bulletPack.push({
            x:bullet.x,
            y:bullet.y,
            id:i
        })
    }
    
//for each entity, push x,y,and entity name into the packet
    for (var i in ENTITY_LIST) {
        var entity = ENTITY_LIST[i];
        
        mapPack.push({
            x:entity.x,
            y:entity.y,
            name:entity.name,
        })
        
        
    }
    //sends packets using socket id
    //send packets to each client
    //emits new position message to client
    for(var i in CONNECT_LIST) {
        var socket = CONNECT_LIST[i];
    socket.emit('newPositions',playerPack, bulletPack, mapPack, scorePack);
    
    }
    }
}, 250/25);