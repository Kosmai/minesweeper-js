const BG_COLOUR = '#231f20';
const MINE_COLOR = '#e66916';
const FLAG_COLOR = '#c2c2c2'
const TILE_COLORS = ['#e4e4e4','#f2f94f','#7df94f','#3cf9f2','#f8ad2c','#1928ff','#12ff6f','#fc12ff','#ff0000'];

const LEFT_CLICK = 1;
const RIGHT_CLICK = 3;
const UNEXPLORED = 0;
const EXPLORED = 1;
const FLAGGED = 2;

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const newGameProBtn = document.getElementById('newGameProButton');
const joinGameBtn = document.getElementById('joinGameButton');
const timerDisplay = document.getElementById('timerDisplay');

const CANVAS_SIZE = 600;
const GRID_SIZE = 20;
const NUM_OF_MINES = 30;

let canvas, ctx, timer, state, elapsedSeconds;
gameStarted = false;


newGameBtn.addEventListener('click', newGame);
setUpCanvas();

function newGame() {
  state = init();
  paintCanvas();
  paintGame(state);
}


function initTimer(field){
  console.log("timer");
  var start = Date.now();
  timer = setInterval(function() {
    var delta = Date.now() - start; // milliseconds elapsed since start

    var totalSeconds = Math.floor(delta / 1000);

    elapsedSeconds = totalSeconds;

    var seconds = totalSeconds % 60;

    var totalMinutes = Math.floor(totalSeconds / 60);
    var minutes = totalMinutes % 60;

    var hours = Math.floor(minutes / 60);

    if(seconds < 10){
      seconds = '0' + seconds;
    }
    if(minutes < 10){
      minutes = '0' + minutes;
    }
    if(hours < 10){
      hours = '0' + hours;
    }
    if(hours > 0){
      field.innerHTML = hours + ":" + minutes + ":" + seconds;
    }
    else{
      field.innerHTML = minutes + ":" + seconds;
    }
  }, 100); // update about every 100ms

  return timer;
}

function resetTimer(field){
  field.innerHTML = "00:00";
}

function init() {
  changeToGameScreen();

  initialState = createInitialGameState();

  return initialState;
}

function setUpCanvas(){
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = CANVAS_SIZE;
  const tileSize = canvas.width / GRID_SIZE;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  canvas.addEventListener('contextmenu', event => event.preventDefault());
  canvas.addEventListener('mousedown', function(e) {
  getCursorPosition(canvas, e, tileSize)})
}

function changeToGameScreen(){
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";
}

function changeToMenuScreen(){
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}

function createInitialGameState() {
  initialState = {
    gridsize: GRID_SIZE,
    table: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)),
    explored: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0))
  };

  var size = initialState.gridsize-1;
  //generate new unique mines
  for(var i=0;i<NUM_OF_MINES; i++){
    do{
      x = randInt(size);
      y = randInt(size);
    }
    while(initialState.table[x][y] >= 100);

    //set mine
    initialState.table[x][y] = 100;

    //increase around numbers
    if(x == 0){
      if(y == 0){
        initialState.table[x+1][y]   += 1;
        initialState.table[x+1][y+1] += 1; 
        initialState.table[x][y+1]   += 1; 
      }
      else if(y == size){
        initialState.table[x+1][y-1] += 1;
        initialState.table[x+1][y]   += 1;
        initialState.table[x][y-1]   += 1;
      }
      else{
        initialState.table[x+1][y+1] += 1; 
        initialState.table[x][y+1]   += 1; 
        initialState.table[x+1][y-1] += 1;
        initialState.table[x+1][y]   += 1;
        initialState.table[x][y-1]   += 1;
      }
    }
    else if(x == size){
      if(y == 0){
        initialState.table[x-1][y]   += 1;
        initialState.table[x-1][y+1] += 1;
        initialState.table[x][y+1]   += 1; 
      }
      else if(y == size){
        initialState.table[x-1][y]   += 1;
        initialState.table[x-1][y-1] += 1;
        initialState.table[x][y-1]   += 1;
      }
      else{
        initialState.table[x-1][y]   += 1;
        initialState.table[x-1][y+1] += 1;
        initialState.table[x][y+1]   += 1;
        initialState.table[x-1][y-1] += 1;
        initialState.table[x][y-1]   += 1; 
      }
    }
    else{
      initialState.table[x+1][y-1] += 1;
      initialState.table[x+1][y]   += 1;
      initialState.table[x+1][y+1] += 1; 
      initialState.table[x-1][y]   += 1;
      initialState.table[x-1][y+1] += 1;
      initialState.table[x-1][y-1] += 1;
      initialState.table[x][y+1]   += 1; 
      initialState.table[x][y-1]   += 1;
    }
  }

  return initialState;
}

function paintCanvas(){
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const gridsize = state.gridsize;
  const tileSize = canvas.width / gridsize;
}

function paintGame(state) {
  const table = state.table;
  const gridsize = state.gridsize;
  const tileSize = canvas.width / gridsize;

  paintCanvas();

  ctx.font = "20px Arial";

  for(var x = 0; x < gridsize; x++){
    for(var y = 0; y < gridsize; y++){
      tile = state.table[x][y];
      explored = state.explored[x][y];

      if(explored == UNEXPLORED){
        ctx.fillStyle = FLAG_COLOR;
        ctx.fillText(".", x * tileSize + 10, y * tileSize + 17);
        continue;
      }
      else if(explored == EXPLORED){
        if(tile >= 100){
          ctx.fillStyle = MINE_COLOR;
          ctx.fillText("x", x * tileSize + 9, y * tileSize + 22);
        }
        else{
          ctx.fillStyle = TILE_COLORS[tile];
          if(tile == 0){
            tile = "";
          }
          ctx.fillText(tile, x * tileSize + 9, y * tileSize + 22);
        }
      }
      else if(explored == FLAGGED){
        ctx.fillStyle = FLAG_COLOR;
        ctx.fillText("#", x * tileSize + 9, y * tileSize + 22);
      }
    }
  }
}

function flagTile(x, y){
  if(!isExplored(x, y, state)){
    if(isFlagged(x, y, state)){
      state.explored[x][y] = UNEXPLORED;
    }
    else{
      state.explored[x][y] = FLAGGED;
    }
    paintGame(state);
  }
}

function revealTile(x, y, state){
  if(outOfBounds(x,y,state)){
    return;
  }
  if(isFlagged(x, y, state)){
    return;
  }
  if(isMine(x, y, state)){
    //lose
    loseGame();
    return;
  }
  exploreTile(x,y,state);
}

function openTile(x, y){
  if(isFlagged(x, y, state)){
    return;
  }
  if(isMine(x, y, state)){
    //lose
    loseGame();
    return;
  }
  if(!isExplored(x, y, state)){
    exploreTile(x, y, state);
  }
  else{
      if(!isSatisfied(x,y,state)){
        return;
      }
      //todo check amount of flags is good
      revealTile(x-1,y-1,state);
      revealTile(x-1, y ,state);
      revealTile(x-1,y+1,state);
      revealTile( x ,y-1,state);
      revealTile( x ,y+1,state);
      revealTile(x+1,y-1,state);
      revealTile(x+1, y ,state);
      revealTile(x+1,y+1,state);    
  }
  paintGame(state);
}

function isSatisfied(x, y, state){
  var counter = 0;

  if(isFlagged(x-1,y-1,state)){counter++;}
  if(isFlagged(x-1, y ,state)){counter++;}
  if(isFlagged(x-1,y+1,state)){counter++;}
  if(isFlagged( x ,y-1,state)){counter++;}
  if(isFlagged( x ,y+1,state)){counter++;}
  if(isFlagged(x+1,y-1,state)){counter++;}
  if(isFlagged(x+1, y ,state)){counter++;}
  if(isFlagged(x+1,y+1,state)){counter++;}

  if(state.table[x][y] == counter){
    return true;
  }
  return false;
}

function exploreTile(x, y, state){
  if(outOfBounds(x,y,state)){
    return;
  }
  if(isMine(x,y,state)){
    return;
  }
  if(isFlagged(x,y,state)){
    return;
  }
  if(!isExplored(x, y, state)){
    state.explored[x][y] = EXPLORED;
    if(state.table[x][y] == 0){
      exploreTile(x-1,y-1,state);
      exploreTile(x-1, y ,state);
      exploreTile(x-1,y+1,state);
      exploreTile( x ,y-1,state);
      exploreTile( x ,y+1,state);
      exploreTile(x+1,y-1,state);
      exploreTile(x+1, y ,state);
      exploreTile(x+1,y+1,state);
    }
  }
  return;
}

function loseGame(){
  gameStarted = false;
  //implement something better
  window.alert("You lost");
  clearInterval(timer);
  resetTimer(timerDisplay);
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}

function winGame(){
  gameStarted = false;
  //implement something better
  window.alert("You won in " + elapsedSeconds + " seconds");
  clearInterval(timer);
  resetTimer(timerDisplay);
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";  
}

function outOfBounds(x,y,state){
  if(x < 0 || x >= state.gridsize || y < 0 || y >= state.gridsize){
    return true;
  }
  return false;
}

function isMine(x, y, state){
  if(outOfBounds(x,y,state)){
    return false;
  }
  if(state.table[x][y] >= 100){
    return true;
  }
  return false;
}

function isExplored(x, y, state){
  if(state.explored[x][y] == EXPLORED){
    return true;
  }
  return false;
}

function isFlagged(x, y, state){
  if(outOfBounds(x,y,state)){
    return false;
  }
  if(state.explored[x][y] == FLAGGED){
    return true;
  }
  return false;
}

function checkWinCondition(state){
  var flags = 0;
  var valid_flags = 0;
  //count how many flags exist and how many are correct
  for(var x=0; x<=state.gridsize; x++){
    for(var y=0; y<=state.gridsize; y++){
      if(isFlagged(x,y,state)){
        flags++;
        if(isMine(x,y,state)){
          valid_flags++;
        }
      }
    }
  }
  //check that all flags are valid and equal to the mine amount
  if(flags == NUM_OF_MINES && flags == valid_flags){
    return true;
  }
  return false;
}

function getCursorPosition(canvas, event, tilesize) {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  if(event.which == LEFT_CLICK){
    handleCanvasLeftClick(x, y, tilesize);
  }
  else if(event.which == RIGHT_CLICK){
    handleCanvasRightClick(x, y, tilesize);
  }
}

function handleCanvasRightClick(x, y, tilesize){
  flagTile(Math.floor(x/tilesize), Math.floor(y/tilesize));
  if(checkWinCondition(state)){
    winGame();
  }
}

function handleCanvasLeftClick(x, y, tilesize){
  if(gameStarted == false){
    timer = initTimer(timerDisplay);
    gameStarted = true;
  }
  openTile(Math.floor(x/tilesize), Math.floor(y/tilesize));
}

function randInt(max) {
    return Math.floor(Math.random() * max) + 1;
}

