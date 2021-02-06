//***CONNECT 4 - by: Etienne Deneault*** 

// Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
// column until a player gets four -in -a - row(horiz, vert, or diag) or until
// board fills(tie)


// SELECTORS
const startButton = document.querySelector('#start');
const resetButton = document.querySelector('#reset');
const timeUpdate = document.querySelector('#current-time');
const introContainer = document.querySelector('.intro-container');
const introDiv = document.createElement('div');
const introText = document.createElement('h3');
const endContainer = document.querySelector('.end-container');
const endDiv = document.createElement('div');
const endText = document.createElement('h3');
const table = document.createElement("table");
const gameContainer = document.querySelector('#game');
const htmlBoard = document.getElementById("board");
const shortGameBoard = document.querySelector('#short-game');
const longGameBoard = document.querySelector('#long-game');

let shortGame = JSON.parse(localStorage.getItem("short-game"));
let longGame = JSON.parse(localStorage.getItem("long-game"));


// GLOBAL VARIABLE INITIALIZATION
const WIDTH = 7; // Board Colunms
const HEIGHT = 6; // Board Rows
let timeOutput = 0; //timer initial value
let currPlayer = 1; // active player: 1 or 2
let board = []; // array of rows, each row is array of cells  (board[y][x])
let winner = false; //set winner to false at game start
let gameStart = 0; // variable used to prevent START button to be clickable once game starts





// GAME FUNCTIONS
const setScoreboard = () => {
  // COMMENT: set scoreboard values for the scoreboard mark-up from local storage
  shortGameBoard.innerText = shortGame;
  longGameBoard.innerText = longGame;

  // COMMENT: if scoreboard values empty set 0 to local storage and the mark-up
  // else set values from local storage to the mark-up

  if (localStorage.getItem("short-game") === null) {
    localStorage.setItem('short-game', JSON.stringify(0));
    shortGame = 0;
    shortGameBoard.innerText = shortGame;
  };

  if (localStorage.getItem("long-game") === null) {
    localStorage.setItem('long-game', JSON.stringify(0));
    longGame = 0;
    longGameBoard.innerText = longGame;
  };
};

function makeBoard() {
  // COMMENT: creates the "in memory" references for the game board.
  for (let y = 0; y < HEIGHT; y++) {
    board.push(Array.from({ length: WIDTH }));
  };
};

// DYNAMIC HTML MARK-UP
function makeHtmlBoard() {
  // COMMENT: get the mark-up div element with id "board"
  const gameContainer = document.querySelector('#game');

  // COMMENT: creates the table for the gameBoard
  const table = document.createElement("table");
  table.classList.add('col-sm-8', 'col-12', 'mx-auto');
  table.setAttribute("id", "board");
  gameContainer.append(table);

  // COMMENT: Creates the top part of the game board, sets and id and eventListener
  const htmlBoard = document.getElementById("board");
  const top = document.createElement("tr");
 
  top.setAttribute("id", "column-top");
  // COMMENT: add event listener to to the cells on the the top row
  top.addEventListener("click", handleClick);
  // COMMENT: iterate using the WIDTH of the array as the
  // reference, create table data, set an id using the index as the id value.
  // Append the td elements to the tr element.
  for (let x = 0; x < WIDTH; x++) {
    const headCell = document.createElement("td");
    headCell.setAttribute("id", x);
    top.append(headCell);
  }
  // COMMENT: append the the top row to the mark-up (htmlBoard)
  table.append(top);

  // COMMENT: nested loop to create the rows of divs
  for (let y = 0; y < HEIGHT; y++) {
    // COMMENT: create a tr element for each row uising HEIGHT reference
    const row = document.createElement("tr");
    for (let x = 0; x < WIDTH; x++) {
      // COMMENT: create td element for each cell using WIDTH reference
      const cell = document.createElement("td");
      // COMMENT: add id attribute to each cell set to the index of inner and outerloop 
      // COMMENT: seperated by a dash.  (needed to identify cell status/targets)
      cell.setAttribute("id", `${y}-${x}`);
      // COMMENT: append the cell to the row
      row.append(cell);
    };
    // COMMENT: append the row to the mark-up game board
    htmlBoard.append(row);
  };
};

/** findSpotForCol: given column x, return top empty y (null if filled) */

function findSpotForCol(x) {
  console.log("in findSpot");
  for (let y = HEIGHT - 1; y >= 0; y--) {
    if (!board[y][x]) {
      return y;
    };
  };
  return null;
};

/** placeInTable: update DOM to place piece into HTML table of board */

function placeInTable(y, x) {
  // COMMENT:create div and classes "gamePiece" and "currentPlayer"
  // also adds a star character insite each div
  console.log(currPlayer);
  const pieceDiv = document.createElement('div');
  pieceDiv.classList.add("gamePiece", `p${currPlayer}`);
  pieceDiv.innerText = '*'
  console.log(`${-50 * (y + 2)}px`);
 
  const pieceLoc = document.getElementById(`${y}-${x}`);
  pieceDiv.innerHTML = '<h1 class="star">☆</h1>';

  pieceLoc.append(pieceDiv);

};

/** endGame: announce game end */

function endGame(msg) {
  // TODO: pop up alert message
  // COMMENT: I left this function here but it could have been moved into the gameReset
  // function.  I decided to add a dynamic html message instead of an "alert".  The
  // mark-up for it is in function gameReset.

  if (parseInt(timeUpdate.innerText) > parseInt(longGame) || parseInt(longGame) === 0) {
    longGame = timeUpdate.innerText;
    longGameBoard.innerText = longGame;
    localStorage.setItem('long-game', JSON.stringify(parseInt(longGame)));
  }

  if (parseInt(timeUpdate.innerText) < parseInt(shortGame) || parseInt(shortGame) === 0) {
    shortGame = timeUpdate.innerText;
    shortGameBoard.innerText  = shortGame;
    localStorage.setItem('short-game', JSON.stringify(parseInt(shortGame)));
  }
 
}

/** handleClick: handle click of column top to play piece */

function handleClick(evt) {
  console.log(evt);
  if (winner) return;
  // COMMENT: get x from ID of clicked cell
  const x = +evt.target.id;
  console.log(x);
  // COMMENT:get next spot in column (if none, ignore click)
  const y = findSpotForCol(x);

  if (y === null) {
    return;
  }
  // COMMENT: place piece in board and add to HTML table
  // COMMENT: place the vslue into in-memory board
  board[y][x] = currPlayer;

  placeInTable(y, x);
  // COMMENT: place the into in-memory board
  checkForWin();
  // COMMENT: check for win
  if ( winner === true) { 
    winner = true;
    // COMMENT:  add set timeout to allow piece to finish falling
    setTimeout(function () {
     
      return  gameReset();
    }, 1000);
  
    };

  // COMMENT:  check if all cells in board are filled; if so call, call endGame
  if (board.every(row => row.every(cell => cell))) {
    console.log('TIE');
    return endGame('Tie!');
  };
  // COMMENT: switch players -  easy condition check with ternary operator
  currPlayer = currPlayer === 1 ? 2 : 1;

}

/** checkForWin: check board cell-by-cell for "does a win start here?" */

function checkForWin() {
  function _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer

    return cells.every(
      ([y, x]) =>
        
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        board[y][x] === currPlayer
    );
  
  }

  board.forEach((row, x, arr) => {
    board.forEach((column, y, arr) => {
      y = y + 1;
      const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];      
      // COMMENT:  check if any of the four winning game states has pieces of the same player

      console.log((_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)));
        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          winner = true;
        }

    });

  })


  // horizArr.push([[y, x], [y, x + 1], [y, x + 2], [y, x + 3]]);
  // console.log(horizArr);

  // COMMENT: nested loop to traverse the array matrix
  // for (let y = 0; y < HEIGHT; y++) {
  //   for (let x = 0; x < WIDTH; x++) {
  //     // console.log('old',x);
  //     //COMMENT: define all 4 legal winning game states
  //     const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
  //     const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
  //     const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
  //     const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];
      
      
  //     // COMMENT:  check if any of the four winning game states has pieces of the same player

  //     // console.log('old: ', vert);
  //     console.log((_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)));
  //     if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
  //             return true;
  //     }
  //   }
  // }
}

// COMMENT: this function listens for a user "start Button" click to 
// start a new gameStart. It invokes the functions needed to initialize the
// game values in-memory and render the board in the mark-up. It also listens
// for a "reset button" click to reset the game from any game state.
function startGame() {
  startButton.addEventListener('click', function(event) {  
    if (gameStart === 0) {
      gameStart++;
      console.log(gameStart);
      introDiv.remove();
      makeBoard();
      makeHtmlBoard();
      startTime();
    }
    else {return}
    });
  
  resetButton.addEventListener('click', (e) => {
    
    gameReset();
  });
}

// COMMENT: function to start timer
const startTime = () => {
  let start = Date.now();
  console.log("date: ", start)
  time = setInterval(function () {
    let delta = Date.now() - start;
    timeOutput = (Math.floor(delta / 1000)); // in seconds
    timeUpdate.innerText = (timeOutput.toString());
  }, 1000);
};

// COMMENT: Function - constructor START message
function introMessage() {
  introDiv.classList.add('container', 'col-12', 'col-sm-4', 'pb-2', 'pt-3');
  introDiv.style.opacity = '1';
  
  introContainer.append(introDiv);
  introDiv.append(introText);
  introText.innerText = `Choose your Settings and Click the START Button`;
}


// COMMENT: Function to reset gane state "in-memory" and in the mark-up
function gameReset() {
 
  // COMMENT: create and append end-game div
  endDiv.classList.add('container', 'col-12', 'col-sm-4');
  endContainer.append(endDiv);
  endDiv.append(endText);
  
  // COMMENT: check if there is a winner and include message in innerText
  if (!winner) {
    endText.innerText = `Game Reset`;
    gameStart = 0;
  }
  else {
    endText.innerText = `Congrats Player ${currPlayer} Wins! The game lasted ${timeOutput} sec.`
    gameStart = 0;
  };
  
  endGame();
  // COMMENT: reset timer
  clearInterval(time);
  // COMMENT: remove end message after 3 sec.
  setTimeout(function() {
    endText.parentNode.remove();
    introDiv.classList.add('container', 'col-12', 'col-sm-4');
    introContainer.append(introDiv);
    introDiv.append(introText);
    introText.innerText = `Click the START Button`;
  }, 3000);
  
  // COMMENT: reset game state values
  gameStart = 0;
  // currPlayer = 1;
  timeOutput = 0;
  winner = false;
  timeUpdate.innerText = (timeOutput.toString());
  
  // COMMENT: reset board "in-memory"
  board = [];

  // COMMENT: removes board from the mark-up
  const oldTable = document.querySelector('#board').remove();

  startGame();
}


//***MAIN***
setScoreboard();
introMessage();
startGame();