const BG_COLOUR = '#231f20';
const MINE_COLOR = '#e66916';
const FLAG_COLOR = '#c2c2c2';
const TILE_COLORS = ['#e4e4e4','#f2f94f','#7df94f','#3cf9f2','#f8ad2c','#1928ff','#12ff6f','#fc12ff','#ff0000'];

const LEFT_CLICK  = 1;
const RIGHT_CLICK = 3;

const UNEXPLORED  = 0;
const EXPLORED    = 1;
const FLAGGED     = 2;

const EASY   = 0;
const NORMAL = 1;
const HARD   = 2;
const EXPERT = 3;

//html handles
const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const restartBtn = document.getElementById('restartButton');
const newGameProBtn = document.getElementById('newGameProButton');
const statsBtn = document.getElementById('statsButton');
const joinGameBtn = document.getElementById('joinGameButton');
const timerDisplay = document.getElementById('timerDisplay');
const speedometer = document.getElementById('speedometer');
const speedometerPointer = document.getElementById('speedometerPointer');
const easyBtn = document.getElementById('easyButton');
const normalBtn = document.getElementById('normalButton');
const hardBtn = document.getElementById('hardButton');
const expertBtn = document.getElementById('expertButton');
const chosenDifficultyDisplay = document.getElementById('chosenDifficultyDisplay');

//Those will change based on difficulty
let CANVAS_SIZE;
let GRID_SIZE;
let NUM_OF_MINES;

//globals
let canvas, ctx, timer, state, elapsedSeconds;
let difficulty = EASY;
let gameStarted = false;

//event listeners
newGameBtn.addEventListener('click', newGame);
restartBtn.addEventListener('click', restartGame);
statsBtn.addEventListener('click', showStats);
easyBtn.addEventListener('click',   function(){setDifficulty(EASY);}, false);
normalBtn.addEventListener('click', function(){setDifficulty(NORMAL);}, false);
hardBtn.addEventListener('click',   function(){setDifficulty(HARD);}, false);
expertBtn.addEventListener('click', function(){setDifficulty(EXPERT);}, false);


//KNOWN BUG - SET UP CANVAS MUST BE RUN ONCE, BUT MUST CHANGE ACCORDING TO LEVEL CHOSEN...
//NOW IT CALLS MULTIPLE EVENT HANDLERS CAUSING FLAGS TO BE UNPLACABLE SOMETIMES (EVERY 2 GAMES)


initializeStatistics();
setDifficulty(EASY);


function newGame() {
  state = beginGame();
  setUpCanvas();
  paintCanvas();
  paintGame(state);
}

function beginGame() {
  changeToGameScreen();

  initialState = createInitialGameState();

  return initialState;
}


//DIFFICULTY FUNCTIONS


function setDifficulty(level){

  switch(level){
    case EASY:
      chosenDifficultyDisplay.innerHTML = "Easy";
      setGridSize(10);
      setMineAmount(10);
      break;
    case NORMAL:
      chosenDifficultyDisplay.innerHTML = "Normal";
      setGridSize(16);
      setMineAmount(25);
      break;
    case HARD:
      chosenDifficultyDisplay.innerHTML = "Hard";
      setGridSize(20);
      setMineAmount(40);
      break;
    case EXPERT:
      chosenDifficultyDisplay.innerHTML = "Expert";
      setGridSize(30);
      setMineAmount(90);
      break;
    default:
      chosenDifficultyDisplay.innerHTML = "Easy";
      difficulty = EASY;
      setGridSize(10);
      setMineAmount(10);
      break;
  }
  setSpeedometer(level);
  difficulty = level;
  return;
}

function setGridSize(size){
  GRID_SIZE = size;
  CANVAS_SIZE = size*30;
}

function setMineAmount(amount){
  NUM_OF_MINES = amount;
}

function setSpeedometer(level){
  if(level == difficulty){
    return;
  }

  if(level == EXPERT){
    speedometer.src = "resources/expert.png";
    speedometerPointer.style.display = "none";
  }
  var animation = "";
  switch(difficulty){
    case EASY:
      if(level == NORMAL){
        animation = "easyToNormal";
      }
      else if(level == HARD){
        animation = "easyToHard";
      }
      break;
    case NORMAL:
      if(level == EASY){
        animation = "normalToEasy";
      }
      else if(level == HARD){
        animation = "normalToHard";
      }
      break;
    case HARD:
      if(level == EASY){
        animation = "hardToEasy";
      }
      else if(level == NORMAL){
        animation = "hardToNormal";
      }
      break;
    case EXPERT:
        speedometer.src = "resources/speedometer.png";
        speedometerPointer.style.display = "block";
      if(level == NORMAL){
        animation = "easyToNormal";
      }
      else if(level == HARD){
        animation = "easyToHard";
      }
      break;
    default:
      return;
  }

  speedometerPointer.style.animation = animation + " 0.5s ease-out forwards";
}



//CHANGE SCREEN FUNCTIONS


function changeToGameScreen(){
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";
}

function changeToMenuScreen(){
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
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

function restartGame(){
  finalizeGame();
}

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
  var winTimes = JSON.parse(localStorage.getItem("winTimes"));
  winTimes.push(elapsedSeconds);
  localStorage.setItem("winTimes", JSON.stringify(winTimes));
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
  document.getElementById("statsModalBody").innerHTML = "";
  showStat("Wins", localStorage.getItem("wins"));
  showStat("Losses", localStorage.getItem("losses"));
  showStat("Total Games", localStorage.getItem("totalGames"));
  const winTimes = JSON.parse(localStorage.getItem("winTimes"));

  if(winTimes.length > 0){
    showStat("Best Time (sec)", Math.min.apply(Math,winTimes));
    document.getElementById("distributionBody");
    distributionBody.innerHTML = String.raw`<br> 
    <h5>Win Time Distribution</h5> 
    <div id="distribution"> 
    <canvas id="myChart" style="width:100%;max-width:700px"></canvas></div>`
    showDistribution();
  }

}

function showStat(text, value){
  document.getElementById('statsModalBody').innerHTML += "<div class=\"text-center\"><h4>" + value + "</h4><p>" + text + "</p></div>";
}

function showDistribution(){
  var xValues = ["0.5-1", "1-1.5", "1.5-2", "2-2.5", "2.5+"];
  var yValues = ['0', '0', '0', '0', '0'];

  JSON.parse(localStorage.getItem("winTimes")).forEach(function (item, index) {
    var bucket = Math.floor(item/30);

    if (bucket > 4){
      bucket = 4;
    }

    yValues[bucket]++;
  });

  var barColors = ["#212529", "#212529", "#212529", "#212529", "#212529"];

  new Chart("myChart", {
    type: "bar",
    data: {
      labels: xValues,
      datasets: [{
        backgroundColor: barColors,
        data: yValues
      }]
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Minutes'
          }
        }],
        yAxes: [{
            ticks: {
                beginAtZero: true,
                stepSize: calculateStepSize(Math.max(yValues)),
                suggestedMax: 5
            }
        }]
      }
    }
  });
}

function calculateStepSize(value){
  return Math.ceil(value/4);
}

function clearStats(){
  localStorage.setItem("totalGames", 0);
  localStorage.setItem("wins", 0);
  localStorage.setItem("losses", 0);
  localStorage.setItem('winTimes', JSON.stringify([]));
  showStats();
}

function initializeStatistics(){
  const wins = localStorage.getItem('wins');
  const losses = localStorage.getItem('losses');
  const totalGames = localStorage.getItem('totalGames');
  var winTimes = localStorage.getItem('winTimes')

  if(wins === null || losses === null || totalGames === null || winTimes === null){
    localStorage.setItem('wins', 0);
    localStorage.setItem('losses', 0);
    localStorage.setItem('totalGames', 0);
    localStorage.setItem('winTimes', JSON.stringify([]));
  }
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



