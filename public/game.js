let players = {}
let coin = {} // the thing everyone's chasing

let gameSize = 2500;

let playerSize = 120;
let coinSize = 50
let maxAccel = 10

//checking collision between the players
function checkCollision(obj1, obj2) {
  return(Math.abs(obj1.x - obj2.x) <= playerSize && Math.abs(obj1.y - obj2.y) <= playerSize)
}

function isValidPosition(newPosition, playerId) {
  //making sure that it stays within the game bounds
  if (newPosition.x < 0 || newPosition.x + playerSize > gameSize) {
    return false
  }
  if (newPosition.y < 0 || newPosition.y + playerSize > gameSize) {
    return false
  }
  // collision check
  var hasCollided = false


  Object.keys(players).forEach((key) => {
    if (key == playerId) { return } // ignore current player in collision check
    player = players[key]
    // if the players overlap
    if (checkCollision(player, newPosition)) {
      hasCollided = true
      return // don't bother checking other stuff
    }
  })
  if (hasCollided) {
    return false
  }

  return true
}

//using Math functions to make coin appear at random spaces within the canvas
function shuffleCoin() {
  let posX = Math.floor(Math.random() * Number(gameSize) - 100) + 10
  let posY = Math.floor(Math.random() * Number(gameSize) - 100) + 10

  while (!isValidPosition({ x: posX, y: posY }, '_coin')) {
    posX = Math.floor(Math.random() * Number(gameSize) - 100) + 10
    posY = Math.floor(Math.random() * Number(gameSize) - 100) + 10
  }

  coin.x = posX
  coin.y = posY
}

function movePlayer(id) {

  let player = players[id]

  let newPosition = {
    x: player.x + player.accel.x,
    y: player.y + player.accel.y
  }
  if (isValidPosition(newPosition, id)) {
    // move the player and increment score
    player.x = newPosition.x
    player.y = newPosition.y
  } else {
    // don't move the player
    // kill accel
    player.accel.x = 0
    player.accel.y = 0
  }

  if (checkCollision(player, coin)) {
    player.score += 1
    shuffleCoin()
  }
}

function accelPlayer(id, x, y) {

  let player = players[id]
  let currentX = player.accel.x
  let currentY = player.accel.y

  // set direction stuff - only used for UI
  if (x > 0) {
    player.direction = 'right'

  } else if (x < 0) {
    player.direction = 'left'

  } else if (y > 0) {
    player.direction = 'down'

  } else if (y < 0) {
    player.direction = 'up'
    
  }

  if (Math.abs(currentX + x) < maxAccel) {
    player.accel.x += x
  }
  if (Math.abs(currentY + y) < maxAccel) {
    player.accel.y += y
  }
}

//cool trick I found on stack overflow -- https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
//allows you to create a color based off of a string - this way each pirate can have a color without it having to be manually assigned to it 

function stringToColour(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

if (!this.navigator) {
  module.exports = {
    players: players,
    stringToColour: stringToColour,
    accelPlayer: accelPlayer,
    movePlayer: movePlayer,
    playerSize: playerSize,
    gameSize: gameSize,
    isValidPosition: isValidPosition,
    coin: coin,
    shuffleCoin: shuffleCoin
  }
}
