let express = require('express');
const { init } = require('express/lib/application');
const { handle } = require('express/lib/router');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let engine = require('./public/game')

let gameInterval
let updateInterval

function pirateName() {
  let names = [
    'Blackbeard',
    'Liza Mcgee',
    'Van Horne',
    'Plank',
    'Patches',
    'Shark-Bait',
    'Hawk',
    'Atlantis',
    'Mullins',
    'Philippe',
    'Red-Lord',
    'Rattlebones',
    'Lazyjacks'
  ]
  return names[Math.floor(Math.random()*names.length)]
}

// TODO: extract below

function gameLoop() {
  // move everyone around
  Object.keys(engine.players).forEach((playerId) => {
    let player = engine.players[playerId]
    engine.movePlayer(playerId)
  })
}

// serve css and js
app.use(express.static('public'))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});



function emitUpdates() {
  //gives players info
  io.emit('gameStateUpdate', { players: engine.players, coin: engine.coin });
}

// set socket listeners

io.on('connection', (socket) => {
  console.log('User connected: ', socket.id)

  // start game if this is the first player
  if (Object.keys(engine.players).length == 0) {
    engine.shuffleCoin()
    gameInterval = setInterval(gameLoop, 25)
    updateInterval = setInterval(emitUpdates, 40)
  }

  // get open position
  let posX = 0
  let posY = 0
  while (!engine.isValidPosition({ x: posX, y: posY }, socket.id)) {
    posX = Math.floor(Math.random() * Number(engine.gameSize) - 100) + 10
    posY = Math.floor(Math.random() * Number(engine.gameSize) - 100) + 10
  }
  // add player to engine.players obj
  engine.players[socket.id] = {
    accel: {
      x: 0,
      y: 0
    },
    x: posX,
    y: posY,
    colour: engine.stringToColour(socket.id),
    score: 0,
    name: pirateName()
    }

  socket.on('disconnect', () => {
    console.log("User Disconnected", socket.id)

  	delete engine.players[socket.id]
  	// end game if there are no engine.players left
  	if (Object.keys(engine.players).length > 0) {
    	io.emit('gameStateUpdate', engine.players);
  	} else {
  		clearInterval(gameInterval)
      clearInterval(updateInterval)
  	}
  })

  //accessing the emitted socket in client.js
  socket.on('up', (msg) => {
    engine.accelPlayer(socket.id, 0, -1)
  });

  socket.on('down', (msg) => {
    engine.accelPlayer(socket.id, 0, 1)
  })

  socket.on('left', (msg) => {
    engine.accelPlayer(socket.id, -1, 0)
  });

  socket.on('right', (msg) => {
    engine.accelPlayer(socket.id, 1, 0)
  })
});

//the port to listen on
http.listen(process.env.PORT || 8800, () => {
  console.log('listening on *:8800', process.env.PORT);
});
