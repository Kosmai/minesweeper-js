const BG_COLOUR = '#231f20';
const MINE_COLOR = '#e66916';
const FLAG_COLOR = '#c2c2c2';
const TILE_COLORS = ['#e4e4e4','#f2f94f','#7df94f','#3cf9f2','#f8ad2c','#1928ff','#12ff6f','#fc12ff','#ff0000'];

const LEFT_CLICK = 1;
const RIGHT_CLICK = 3;
const UNEXPLORED = 0;
const EXPLORED = 1;
const FLAGGED = 2;

//html handles
const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const statsScreen = document.getElementById('statsScreen');
const newGameBtn = document.getElementById('newGameButton');
const restartBtn = document.getElementById('restartButton');
const newGameProBtn = document.getElementById('newGameProButton');
const statsBtn = document.getElementById('statsButton');
const menuBtn = document.getElementById('menuButton');
const joinGameBtn = document.getElementById('joinGameButton');
const clearStatsBtn = document.getElementById('clearStatsButton');
const timerDisplay = document.getElementById('timerDisplay');

//Those will change based on difficulty
const CANVAS_SIZE = 600;
const GRID_SIZE = 20;
const NUM_OF_MINES = 30;

//globals
let canvas, ctx, timer, state, elapsedSeconds;
let gameStarted = false;

//event listeners
newGameBtn.addEventListener('click', newGame);
restartBtn.addEventListener('click', restartGame);
statsBtn.addEventListener('click', showStats);
menuBtn.addEventListener('click', changeToMenuScreen);
clearStatsBtn.addEventListener('click', clearStats);


setUpCanvas();







function newGame() {
  state = beginGame();
  paintCanvas();
  paintGame(state);
}

function beginGame() {
  changeToGameScreen();

  initialState = createInitialGameState();

  const wins = localStorage.getItem('wins');
  const losses = localStorage.getItem('losses');

  if(wins === null || losses === null){
    localStorage.setItem('wins', 0);
    localStorage.setItem('losses', 0);
    localStorage.setItem('totalGames', 0);
  }

  return initialState;
}

function restartGame(){
  location.reload();
}



//CHANGE SCREEN FUNCTIONS


function changeToGameScreen(){
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";
  statsScreen.style.display = "none";
}

function changeToMenuScreen(){
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
  statsScreen.style.display = "none";
}

function changeToStatsScreen(){
  initialScreen.style.display = "none";
  gameScreen.style.display = "none";
  statsScreen.style.display = "block";
}


//GAME DISPLAY FUNCTIONS


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


//EVENT HANDLING FUNCTIONS


function loseGame(){
  //implement something better
  window.alert("You lost");
  localStorage.setItem("losses", parseInt(localStorage.getItem("losses")) + 1);
  finalizeGame();
}

function winGame(){
  //implement something better
  window.alert("You won in " + elapsedSeconds + " seconds");
  localStorage.setItem("wins", parseInt(localStorage.getItem("wins")) + 1);
  finalizeGame();
}

function finalizeGame(){
  gameStarted = false;
  localStorage.setItem("totalGames", parseInt(localStorage.getItem("totalGames")) + 1);
  clearInterval(timer);
  resetTimerDisplay(timerDisplay);
  changeToMenuScreen();
}


//STATS FUNCTIONS


function showStats(){
  changeToStatsScreen();
  document.getElementById('stats').innerHTML = "";
  document.getElementById('stats').innerHTML += "<h2>Total Games: " + localStorage.getItem('totalGames') + "</h2>";
  document.getElementById('stats').innerHTML += "<h2>    Wins:    " + localStorage.getItem('wins') + "</h2>";
  document.getElementById('stats').innerHTML += "<h2>   Losses:   " + localStorage.getItem('losses') + "</h2>";
}

function clearStats(){
  localStorage.setItem("totalGames", 0);
  localStorage.setItem("wins", 0);
  localStorage.setItem("losses", 0);
  showStats();
}


//TIMER FUNCTIONS


function initTimer(field){
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

function resetTimerDisplay(field){
  field.innerHTML = "00:00";
}


//GAME MECHANICS RELATED FUNCTIONS


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
    loseGame();
    return;
  }
  if(!isExplored(x, y, state)){
    exploreTile(x, y, state);
  }
  else{
      //checks that the amount of flags is equal to the number of the tile
      if(!isSatisfied(x,y,state)){
        return;
      }
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


//GAME MECHANICS HELPER FUNCTIONS


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


//CANVAS HANDLING FUNCTIONS

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

function paintCanvas(){
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const gridsize = state.gridsize;
  const tileSize = canvas.width / gridsize;
}

//UTILS

function randInt(max) {
    return Math.floor(Math.random() * max) + 1;
}

