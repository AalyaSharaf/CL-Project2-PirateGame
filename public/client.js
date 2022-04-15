  $(function () {
    let socket = io();
    let canvas = document.getElementById('game');
    let ctx = canvas.getContext('2d');


    let localDirection // used to display accel direction

    socket.on('gameStateUpdate', updateGameState);
    socket.on('countdown', countdown)
    socket.on("GameOver", gameOver)

    function countdown(){

    }

    function gameOver(){
      element = document.getElementById("timer")
      if (player.score > 1){
        alert("You Won")
      }
    }


    function drawPlayers(players) {
      // draw players
      // the game world is 500x500, but we're downscaling 5x to smooth accel out
      Object.keys(players).forEach((playerId) => {
        let player = players[playerId]
        let direction

        ctx.fillStyle = player.colour;
        ctx.fillRect(player.x/5, player.y/5, playerSize/5, playerSize/5);

        if (playerId == socket.id) {
          direction = localDirection
        } else {
          direction = player.direction
        }

        
        // draw accel direction for current player based on local variable
        // the idea here is to give players instant feedback when they hit a key
        // to mask the server lag
        ctx.fillStyle = 'black';
        let accelWidth = 3
        switch(direction) {
          case 'up':
            ctx.fillRect(player.x/5, player.y/5 - accelWidth, playerSize/5, accelWidth);
            break
          case 'down':
            ctx.fillRect(player.x/5, player.y/5  + playerSize/5, playerSize/5, accelWidth);
            break
          case 'left':
            ctx.fillRect(player.x/5 - accelWidth, player.y/5, accelWidth, playerSize/5);
            break
          case 'right':
            ctx.fillRect(player.x/5 + playerSize/5, player.y/5, accelWidth, playerSize/5);
        }
      })
    }

    function updateGameState(gameState) {
      // update local state to match state on server
      players = gameState.players
      coin = gameState.coin

      // draw stuff

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // set score info - taking into account the number of pirates when displaying text
      let playerCount = Object.keys(players).length

      document.getElementById('playerCount').innerHTML = String(playerCount) + " pirate" + (playerCount > 1 ? 's' : '') + " on the salty seas"

      let scores = ''

    //   let timerID = setInterval(countdown, 1000)

    //   function countdown(){
    //     if (timerLeft == -1){
    //       clearTimeout(timerID)
    //       gameOver()
          
    //     } else {
    //       element.innerHTML = timerLeft + " seconds remaining";
    //       timerLeft--;
    //     }
    // }

    function gameOver(){
      console.log("You Won")
    }

      //sorting object properties by values
      Object.values(players).sort((a,b) => (b.score - a.score)).forEach((player, index) => {
        scores += "<h3><span style='border-bottom: 1px solid " + player.colour + ";'>" + player.name + "</span> has " + player.score + " coins</h3>"
      })


      document.getElementById('scores').innerHTML = scores
      // document.getElementById("timer").innerHTML = timer

      // draw coin
      ctx.beginPath();
      ctx.arc((coin.x + coinSize/2)/5, (coin.y + coinSize/2)/5, coinSize/5, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'gold';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#003300';
      ctx.stroke();

      drawPlayers(players)
    }

    // key handling
    //emitting the words that are used in the index.js file to control movement
    $('html').keydown(function(e) {
      if (e.key == "ArrowDown") {
        socket.emit('down', players);
        accelPlayer(socket.id, 0, 1)
        localDirection = 'down'

      } else if (e.key == "ArrowUp") {
        socket.emit('up', players);
        accelPlayer(socket.id, 0, -1)
        localDirection = 'up'

      } else if (e.key == "ArrowLeft") {
        socket.emit('left', players);
        accelPlayer(socket.id, -1, 0)
        localDirection = 'left'

      } else if (e.key == "ArrowRight") {
        socket.emit('right', players);
        accelPlayer(socket.id, 1, 0)
        localDirection = 'right'
      }
    })

    function gameLoop() {
      // update game
      updateGameState({players: players, coin: coin})
      // move everyone around
      Object.keys(players).forEach((playerId) => {
        let player = players[playerId]
        movePlayer(playerId)
      })
    }

    function drawGame() {
      // draw stuff
      drawPlayers(players)
      requestAnimationFrame(drawGame)
    }

    setInterval(gameLoop, 25)
    requestAnimationFrame(drawGame)
    
    let timeElm = document.getElementById("timer")
    let timer = (x) => {
      if (x === 0){
        alert("Game Over! Refresh to play again!")
      }
      
      timeElm.innerHTML = x + " seconds remaining"
      return setTimeout(() => {
        timer(--x)
      }, 1000);
    }
  
      timer(30)

  });
