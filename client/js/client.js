    var ctx = document.getElementById("ctx").getContext("2d");
    var Img = {};
    Img.player = new Image();
    Img.player.src = '/client/img/Paddle1.png';
    Img.ball = new Image();
    Img.ball.src = '/client/img/Ball.png'
    

    var socket = io();

        socket.on('newPositions', function(data){
            ctx.clearRect(0,0,500,500);
            for(var i = 0; i < data.length; i++){
                ctx.drawImage(Img.player,data[i].x, data[i].y,100,100);
            }

        });
        //key down listener and sender
        document.onkeydown = function(event){
            if(event.keyCode === 38) //up arrow 
                socket.emit('keypress', {inputId:'up', state:true});
            else if(event.keyCode === 40) //down Arrow
                socket.emit('keypress', {inputId:'down', state:true});

        }
        //key up listener and sender
        document.onkeyup = function(event){
            if(event.keyCode === 38) //up 
                socket.emit('keypress', {inputId:'up', state:false});
            else if(event.keyCode === 40) //down Arrow
                socket.emit('keypress', {inputId:'down', state:false});

        }