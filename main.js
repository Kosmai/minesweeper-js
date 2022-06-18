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
let statsMode = 0;
let debugMode = false;

var onlongtouch; 
var touchTimer;
var touchduration = 100; //length of time we want the user to touch before we do something
var touchDown = false;
var touchDownEvent;

//event listeners
newGameBtn.addEventListener('click', newGame);
restartBtn.addEventListener('click', finalizeGame);
statsBtn.addEventListener('click', showStats);
easyBtn.addEventListener('click',   function(){setDifficulty(EASY);}, false);
normalBtn.addEventListener('click', function(){setDifficulty(NORMAL);}, false);
hardBtn.addEventListener('click',   function(){setDifficulty(HARD);}, false);
expertBtn.addEventListener('click', function(){setDifficulty(EXPERT);}, false);

//KNOWN BUG - SET UP CANVAS MUST BE RUN ONCE, BUT MUST CHANGE ACCORDING TO LEVEL CHOSEN...
//NOW IT CALLS MULTIPLE EVENT HANDLERS CAUSING FLAGS TO BE UNPLACABLE SOMETIMES (EVERY 2 GAMES)


initializeStatistics();
setDifficulty(EASY);

function touchstart(e, canvas, tileSize) {
    touchDown = true;
    e.preventDefault();
    touchDownEvent = e;
    if (!touchTimer) {
        touchTimer = setTimeout(function(){onlongtouch(e, canvas, tileSize);}, touchduration);   
    }
}

function touchend(e, canvas, tileSize) {
    //stops short touches from firing the event
    if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;

    }

    if(touchDown){
      const event = touchDownEvent.touches[0]
      const rect = canvas.getBoundingClientRect();
      const x = event.pageX - rect.left;
      const y = event.pageY - rect.top;
      handleCanvasLeftClick(x, y, tileSize);
    }
}

onlongtouch = function(e, canvas, tileSize) { 
    touchDown = false;
    timer = null;

    const event = e.touches[0]
    const rect = canvas.getBoundingClientRect();
    const x = event.pageX - rect.left;
    const y = event.pageY - rect.top;

    handleCanvasRightClick(x, y, tileSize);
};

function newGame() {
  state = beginGame();
  if(debugMode) {
    revealAllMines(state);
  }
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
      setMineAmount(40);
      break;
    case HARD:
      chosenDifficultyDisplay.innerHTML = "Hard";
      setGridSize(20);
      setMineAmount(80);
      break;
    case EXPERT:
      chosenDifficultyDisplay.innerHTML = "Expert";
      setGridSize(22);
      setMineAmount(100);
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
  var stats = JSON.parse(localStorage.getItem("stats"));
  stats[difficulty]["losses"] += 1;
  localStorage.setItem("stats", JSON.stringify(stats));
  finalizeGame();
}

function winGame(){
  //implement something better
  window.alert("You won in " + elapsedSeconds + " seconds");
  var stats = JSON.parse(localStorage.getItem("stats"));
  stats[difficulty]["wins"] += 1;
  stats[difficulty]["winTimes"].push(elapsedSeconds);
  localStorage.setItem("stats", JSON.stringify(stats));
  finalizeGame();
}

function finalizeGame(){
  gameStarted = false;
  var stats = JSON.parse(localStorage.getItem("stats"));
  stats[difficulty]["totalGames"] += 1;
  localStorage.setItem("stats", JSON.stringify(stats));
  clearInterval(timer);
  resetTimerDisplay(timerDisplay);
  changeToMenuScreen();
}


//STATS FUNCTIONS

function showStats(){
  document.getElementById("stats");

  var stats = JSON.parse(localStorage.getItem("stats"));

  var mode = statsMode;

  var wins;
  var losses;
  var totalGames;
  var winTimes = [];

  if(mode != 4){
    wins = stats[mode]["wins"];
    losses = stats[mode]["losses"];
    totalGames = stats[mode]["totalGames"];
    winTimes = stats[mode]["winTimes"];
  }else{
    wins = 0;
    losses = 0;
    totalGames = 0;
    for (var key in stats){
      wins += stats[key]["wins"];
      losses += stats[key]["losses"];
      totalGames += stats[key]["totalGames"];
      winTimes = [...winTimes, ...stats[key]["winTimes"]];
    }

  }

  document.getElementById("statsModalBody").innerHTML = "";
  showStat("Wins", wins);
  showStat("Losses", losses);
  showStat("Total Games", totalGames);


  document.getElementById("distributionBody");
  showDistribution(winTimes);
}

function showStat(text, value){
  document.getElementById('statsModalBody').innerHTML += "<div class=\"text-center\"><h4>" + value + "</h4><p>" + text + "</p></div>";
}

function showDistribution(winTimes){
  var xValues = ["0-0.5", "0.5-1", "1-1.5", "1.5-2", "2+"];
  var yValues = [0, 0, 0, 0, 0];

  winTimes.forEach(function (item, index) {
    var bucket = Math.floor(item/30);

    if (bucket > 4){
      bucket = 4;
    }

    yValues[bucket]++;
  });

  var barColors = ["#212529", "#212529", "#212529", "#212529", "#212529"];
  
  const oldChart = Chart.getChart("timeDistributionChart");

  if(oldChart !== undefined){
    oldChart.destroy();
  }

  new Chart("timeDistributionChart", {
    type: "bar",
    data: {
      labels: xValues,
      datasets: [{
        backgroundColor: barColors,
        data: yValues
      }]
    },
    options: {
      plugins: {
          legend: {
              display: false
          }
      },
      scales: {
        y:{
          suggestedMax: 5,
          ticks:{
            stepSize: calculateStepSize(Math.max.apply(Math, yValues)),
            beginAtZero: true,
          }
        },
        x:{
          title: {
            display: true,
            text: "Minutes"
          }
        }
      }
    }
  });
}

function calculateStepSize(value){
  if(value === NaN || value == 0){
    return 1;  
  }
  return Math.ceil(value/4);
}

function initializeStatistics(){
  var stats = localStorage.getItem("stats");

  if (stats === null){
      stats = {
        0 : {
          "totalGames" : 0,
          "wins" : 0,
          "losses" : 0,
          "winTimes" : []
        },
        1:{
          "totalGames" : 0,
          "wins" : 0,
          "losses" : 0,
          "winTimes" : []
        },
        2:{
          "totalGames" : 0,
          "wins" : 0,
          "losses" : 0,
          "winTimes" : []
        },
        3:{
          "totalGames" : 0,
          "wins" : 0,
          "losses" : 0,
          "winTimes" : []
        }
    }

    localStorage.setItem("stats", JSON.stringify(stats));
  }

}

function setStatsMode(value){
  statsMode = value;
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
    updateNeighboringNodes(x, y, initialState);
  }

  return initialState;
}

function updateNeighboringNodes(x, y, state){
  for(let i = -1; i <= 1; i++){
    for(let j = -1; j <= 1; j++){
      let neighborX = x+i;
      let neighborY = y+j;
      if(neighborX == neighborY || outOfBounds(neighborX,neighborY,state)) continue;
      state.table[neighborX][neighborY] += 1;
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

function revealAllMines(state){
  for(let x=0; x<=state.gridsize; x++){
    for(let y=0; y<=state.gridsize; y++){
      if(isMine(x,y,state)){
        state.explored[x][y] = FLAGGED;
      }
    }
  }
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


//CANVAS HANDLING FUNCTIONS

function setUpCanvas(){
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = CANVAS_SIZE;
  const tileSize = canvas.width / GRID_SIZE;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var newCanvas = canvas.cloneNode(true);

  canvas.parentNode.replaceChild(newCanvas, canvas);

  canvas = newCanvas;
  ctx = canvas.getContext("2d");

  canvas.addEventListener('contextmenu', event => event.preventDefault());
  canvas.addEventListener('mousedown', function(e) {
  getCursorPosition(canvas, e, tileSize);});
  canvas.addEventListener("touchstart", function(e){
    touchstart(e, canvas, tileSize);
  });
  canvas.addEventListener("touchend", function(e){
    touchend(e, canvas, tileSize);});
}


function getCursorPosition(canvas, event, tilesize, mobile = false) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

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
