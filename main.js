const BG_COLOUR = '#231f20';
const MINE_COLOR = '#e66916';
const FLAG_COLOR = '#c2c2c2'
const TILE_COLORS = ['#e4e4e4','#f2f94f','#7df94f','#3cf9f2','#f8ad2c','#1928ff','#12ff6f','#fc12ff','#ff0000'];


const NUM_OF_MINES = 30;

const koubaScreen = document.getElementById('koubaScreen');
const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const newGameProBtn = document.getElementById('newGameProButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameDifficultyDisplay = document.getElementById('gameDifficultyDisplay');

newGameBtn.addEventListener('click', newGame);
newGameProBtn.addEventListener('click', newProGame);

PRO_MODE = false;

state = {};

function newProGame(){
  click_counter = 0;
  PRO_MODE = true;
  state = init();
  paintCanvas();
  paintGame();
}

function newGame() {
  click_counter = 0;
  state = init();
  paintCanvas();
  paintGame(state);
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

function displayKouba(){
  if(!PRO_MODE){
    location.reload();
    return;
  }
  gameScreen.style.display = "none";
  initialScreen.style.display = "none"
  koubaScreen.style.display = "block";
}

function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  initialState = createInitialGameState();

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.addEventListener('contextmenu', event => event.preventDefault());

  canvas.width = canvas.height = 600;
  const tileSize = canvas.width / initialState.gridsize;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  canvas.addEventListener('mousedown', function(e) {
    getCursorPosition(canvas, e, tileSize)})
  gameActive = true;

  return initialState;
}

function createInitialGameState() {
  initialState = {
    gridsize: 20,
    table: [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      ],
    explored: [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      ]
  };
  //generate new unique mines
  for(var i=1;i<=NUM_OF_MINES; i++){
    do{
      x = randInt(19);
      y = randInt(19);
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
      else if(y == 19){
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
    else if(x == 19){
      if(y == 0){
        initialState.table[x-1][y]   += 1;
        initialState.table[x-1][y+1] += 1;
        initialState.table[x][y+1]   += 1; 
      }
      else if(y == 19){
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
  // for (x=0;x<=600;x+=30) {
  //       for (y=0;y<=600;y+=30) {
  //           ctx.moveTo(x, 0);
  //           ctx.lineTo(x, 600);
  //           ctx.stroke();
  //           ctx.moveTo(0, y);
  //           ctx.lineTo(600, y);
  //           ctx.stroke();
  //       }
  //   }
}

function paintGame(state) {
  const table = state.table;
  const gridsize = state.gridsize;
  const tileSize = canvas.width / gridsize;

  paintCanvas();

  ctx.font = "20px Arial";

  for(var x = 0; x < state.gridsize; x++){
    for(var y = 0; y < state.gridsize; y++){
      tile = state.table[x][y];
      explored = state.explored[x][y];
      console.log(explored);
      if(explored == 0){
        continue;
      }
      else if(explored == 1){
        if(tile >= 100){
          ctx.fillStyle = MINE_COLOR;
          ctx.fillText("x", x * tileSize + 9, y * tileSize + 22);
        }
        else{
          ctx.fillStyle = TILE_COLORS[tile];
          if(tile == 0){
            tile = ".";
          }
          ctx.fillText(tile, x * tileSize + 9, y * tileSize + 22);
        }
      }
      else if(explored == 2){
        ctx.fillStyle = FLAG_COLOR;
        ctx.fillText("#", x * tileSize + 9, y * tileSize + 22);
      }
    }
  }
}

function flagTile(tileX, tileY){
  if(!isOpen(tileX, tileY, state)){
    if(isFlagged(tileX, tileY, state)){
      state.explored[tileX][tileY] = 0;
    }
    else{
      state.explored[tileX][tileY] = 2;
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
    window.alert("You lost");
    displayKouba();
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
    window.alert("You lost");
    displayKouba();
    return;
  }
  if(!isOpen(x, y, state)){
    exploreTile(x, y, state);
  }
  else{
      console.log("test");
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
  if(!isOpen(x, y, state)){
    state.explored[x][y] = 1;
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

function outOfBounds(x,y,state){
  if(x < 0 || x >= state.gridsize || y < 0 || y >= state.gridsize){
    return true;
  }
  return false;
}

function isMine(x, y, state){
  if(state.table[x][y] >= 100){
    return true;
  }
  return false;
}

function isOpen(x, y, state){
  if(state.explored[x][y] == 1){
    return true;
  }
  return false;
}

function isFlagged(x, y, state){
  if(state.explored[x][y] == 2){
    return true;
  }
  return false;
}

function getCursorPosition(canvas, event, tilesize) {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  //console.log("x: " + x + " y: " + y)
  if(event.which == 1){
    handleCanvasLeftClick(x, y, tilesize);
  }
  else if(event.which == 3){
    handleCanvasRightClick(x, y, tilesize);
  }
}

function handleCanvasRightClick(x, y, tilesize){
  click_counter++;
  flagTile(Math.floor(x/tilesize), Math.floor(y/tilesize));
}

function handleCanvasLeftClick(x, y, tilesize){
  click_counter++;
  if(click_counter >= 8){
    displayKouba();
  }
  openTile(Math.floor(x/tilesize), Math.floor(y/tilesize));
}

function randInt(max) {
    return Math.floor(Math.random() * max) + 1;
}

