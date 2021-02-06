/////////////////////////////////////////////////////////////////////////////////
// CONNECT 4 - OO Version by: Etienne Deneault                                 //
//                                                                             //
// Player 1 and 2 alternate turns. On each turn, a piece is dropped down a     //
// column until a player gets four -in -a - row(horiz, vert, or diag) or until //
// board fills(tie)                                                            //
/////////////////////////////////////////////////////////////////////////////////

// SELECTORS //
const startButton = document.querySelector('#start');
const resetButton = document.querySelector('#reset');
const p1Button = document.getElementById('p1-color');
const p2Button = document.getElementById('p2-color');
const compButton = document.getElementById('comp-color');;
const introContainer = document.querySelector('.intro-container');
const introDiv = document.createElement('div');
const introText = document.createElement('p');
const endContainer = document.querySelector('.end-container');
const endDiv = document.createElement('div');
const endText = document.createElement('p');
const sbBackground = document.querySelector('#sb-background');

const shortGameBoard = document.querySelector('#short-game');
const longGameBoard = document.querySelector('#long-game');

let shortGame = JSON.parse(localStorage.getItem("short-game"));
let longGame = JSON.parse(localStorage.getItem("long-game"));
const timeUpdate = document.querySelector('#current-time');

const snd = new Audio("Dragon-roar-sound.mp3"); // buffers automatically when created

// CLASSES Game, Player and Computer extends Player //
class Game {
  constructor(p1, p2, width = 7, height = 6, min = 0) {
    this.players = [p1, p2];
    this.width = width;
    this.height = height;
    this.min = min;
    this.currPlayer = p1;
    this.setScoreboard();
    this.startTime();
    this.makeBoard();
    this.makeHtmlBoard();
    this.gameOver = false;
  }
  
  setScoreboard() {
    getItemsStorage();
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

  makeBoard() {
    this.board = [];
    for (let y = 0; y < this.height; y++) {
      this.board.push(Array.from({ length: this.width }));
    }
  }

  makeHtmlBoard() {
    
    const gameContainer = document.querySelector('#game'); // COMMENT: get the mark-up div element with id "board"

    
    const table = document.createElement("table");
    table.classList.add('col-sm-8', 'col-12', 'mx-auto');
    table.setAttribute("id", "board");
    gameContainer.append(table);
  
    // COMMENT: Creates the top part of the game board, sets  "id" property and eventListener
    const board = document.getElementById("board"); 
    const top = document.createElement("tr");
   
    top.setAttribute("id", "column-top");

    this.handleGameClick = this.handleClick.bind(this);  // important bind here

    top.addEventListener('click', this.handleGameClick);
    
    for (let x = 0; x < this.width; x++) {
      const headCell = document.createElement("td");
      headCell.setAttribute("id", x);
      top.append(headCell);
    }
 
    table.append(top);

    // make main part of board
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement("tr");
      
      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement("td");
        cell.setAttribute("id", `${y}-${x}`);
        row.append(cell);
      };
      board.append(row);  // COMMENT: append the row to the mark-up game board
    }
  }
  
  findSpotForCol(x) {
    for (let y = this.height - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }

  placeInTable(y, x) {

    const pieceDiv = document.createElement('div');
    pieceDiv.classList.add("gamePiece");
    pieceDiv.style.backgroundColor = this.currPlayer.color;
    pieceDiv.innerText = '*'
    pieceDiv.style.top = -50 * (y + 2);

    const pieceLoc = document.getElementById(`${y}-${x}`);
    pieceDiv.innerHTML = '<h1 class="star">☆</h1>';
    try {
      pieceLoc.append(pieceDiv);
    }
    catch (e) {
    alert('oops... something went wrong, please reset the game.')
      return;
    }
  }

  endGame(msg) {
    clearInterval(this.time);
    snd.play();  // Play Winning Sound Effect

    //  Update the localStorage if shortest or longest game values pass logic test
    if (parseInt(timeUpdate.innerText) > parseInt(longGame) || parseInt(longGame) === 0) {
      longGame = timeUpdate.innerText;
      longGameBoard.innerText = longGame;
      localStorage.setItem('long-game', JSON.stringify(parseInt(longGame)));
    }
  
    if (parseInt(timeUpdate.innerText) < parseInt(shortGame) || parseInt(shortGame) === 0) {
      shortGame = timeUpdate.innerText;
      shortGameBoard.innerText = shortGame;
      localStorage.setItem('short-game', JSON.stringify(parseInt(shortGame)));
    }
    // Reset time on the scoreboard
    this.timeOutput = 0;
    timeUpdate.innerText = (this.timeOutput.toString());
    document.querySelector('#board').remove();
    gameStart = 0;

    endDiv.classList.add('container', 'col-12', 'col-sm-8', 'msg');
    endContainer.append(endDiv);
    endDiv.append(endText);
    
    // End of game message 
    endText.innerText = msg;

    // COMMENT: remove end message after 3 sec.
    setTimeout(function () {
      endText.parentNode.remove();
      introDiv.classList.add('container', 'col-12', 'col-sm-4', 'msgIntro');
      introContainer.append(introDiv);
      introDiv.append(introText);
      introText.innerText = `Choose your Settings and Click the START Button`;
    }, 3000);
    clearInterval(this.time);
  }

  handleClick(evt) {
    // Condition to determine if this instance of Game is a 2 player game //
    if (this.currPlayer.name === "Player-One" || this.currPlayer.name === "Player-Two") {
      const x = +evt.target.id;
      const y = this.findSpotForCol(x);
      if (y === null) {
        return;
      }
  
      this.board[y][x] = this.currPlayer; // set identifier in memory
      this.placeInTable(y, x); // add piece to the mark-up
  
      // Check for tie //
      if (this.board.every(row => row.every(cell => cell))) {
        return this.endGame('Tie!');
      }
  
      // COMMENT: check for win //
      if (this.checkForWin()) {
        this.gameOver = true;
        return this.endGame(`${this.currPlayer.name} wins!`);
      };
   
      // Player Switch and change the bg color of the scoreboard      
      this.currPlayer = this.currPlayer === this.players[0] ? this.players[1] : this.players[0];
      sbBackground.style.backgroundColor = this.currPlayer.color;
  }
   
    // Using a Promise to build a delay function (flow control)
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    //  Check if the Game is against the Computer Player //
    sleep(1000).then(() => { 
      if (this.currPlayer.name === "Computer-Player") {
        const top = document.querySelector("#column-top");
        top.removeEventListener("click", this.handleGameClick); // Remove the top row event listener during the Computers Play
        const x = this.getRandomArbitrary(); // Provide pseudo-random value
        const y = this.findSpotForCol(x); // find value of y for the piece placement
        if (y === null) {
          return;
        }
    
        this.board[y][x] = this.currPlayer; // update board with Player identifier in position [x,y]
        this.placeInTable(y, x); // Add to mark-up
    
        // Check for tie //
        if (this.board.every(row => row.every(cell => cell))) {
          return this.endGame('Tie!');
        }
    
        // check for win //
        if (this.checkForWin()) {
          this.gameOver = true;
          return this.endGame(`${this.currPlayer.name} wins!`);
        };
        // Switch Player effectively going back to the Player One's trun without having a click event for Computer Player //
        this.currPlayer = this.currPlayer === this.players[0] ? this.players[1] : this.players[0];
        sbBackground.style.backgroundColor = this.currPlayer.color; //change backgrond color of the scoreboardd
      
        this.handleGameClick = this.handleClick.bind(this);  // important bind here
        top.addEventListener('click', this.handleGameClick); // add the event listener back to the top row for the P1 turn.
      }
      else {return} // ToDo something should be here for error handling
   });
    
  }

  checkForWin() {
    const _win = cells =>
      // Check four cells to see if they're all color of current player
      //  - cells: list of four (y, x) cells
      //  - returns true if all are legal coordinates & all match currPlayer
  
      // Determines if a winning state is true //
      cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < this.height &&
          x >= 0 &&
          x < this.width &&
          this.board[y][x] === this.currPlayer
      );
    
    // Nested loop to traverse 2D array //
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
       // create 4 winning game states//
        const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];
  
        // find winner (only checking each win-possibility as needed)
        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
  }

  // Helper Functions //
  startTime() {
    let start = Date.now();
    this.time = setInterval(function () {
      let delta = Date.now() - start;
      this.timeOutput = (Math.floor(delta / 1000)); // in seconds
      timeUpdate.innerText = (this.timeOutput.toString());
    }, 1000);
  };

  getRandomArbitrary() {
    this.min = Math.ceil(this.min);
    this.max = Math.floor(this.height);
    return Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;
    // return Math.floor(Math.random() * (this.height - this.min) + this.min);
  }
}

//Player class extended by Computer class
class Player {
  constructor(color, name) {
    this.color = color; 
    this.name = name;
  }
}

class Computer extends Player {
  constructor(color, name, height=7, min = 0 ) {
    super(color, name);
    this.height = height;
    this.min = min;
  }
 }


 // Global Functions //
function init() {
  gameStart = 0;
  p1Button.value = 'rgba(217, 83, 79, 100%)';
  p2Button.value = 'rgba(240, 173, 78, 100%)';
  compButton.value = 'rgba(91, 192, 222, 100%)';
}

// Function to set localStorage //
function getItemsStorage() {
  let shortGame = JSON.parse(localStorage.getItem("short-game"));
  let longGame = JSON.parse(localStorage.getItem("long-game"));
}
// Function to add colorPicker
function pickColor() {
  const playerOne = p1Button,
        popupP1 = new Picker({
            parent: playerOne,
            popup: 'bottom',
            color: 'rgba(255, 0, 0, .5)',
            editorFormat: 'rgb',
            onDone: function(color) {
              playerOne.style.backgroundColor = color.rgbaString;
              playerOne.style.borderColor = color.rgbaString;
              sbBackground.style.backgroundColor = color.rgbaString;
              playerOne.value = color.rgbaString;
            },
        });
  
  const playerTwo = p2Button,
  popupP2 = new Picker({
      parent: playerTwo,
      popup: 'bottom',
      color: 'rgba(34, 54, 170, 0.8)',
      editorFormat: 'rgb',
      onDone: function(color) {
        playerTwo.style.backgroundColor = color.rgbaString;
        playerTwo.style.borderColor = color.rgbaString;
        sbBackground.style.backgroundColor = color.rgbaString;
        playerTwo.value = color.rgbaString;
      },
  });
}

//Function to display the intro message //
function introMessage() {
  introDiv.classList.add('container', 'col-12', 'col-sm-12', 'pb-2', 'pt-3', 'msgIntro');
  introDiv.style.opacity = '1';
  
  introContainer.append(introDiv);
  introDiv.append(introText);
  introText.innerText = `Choose your Settings and Click the START Button`;
}

////////////////////
//   MAIN GAME    //
////////////////////
init();
getItemsStorage();
introMessage();
pickColor();

// OnClick-start: add event to create a Game instance //
document.querySelector('#start').addEventListener('click', (e) => {
  if (gameStart === 0) {
    gameStart++;
    introDiv.remove();
      
    let p1 = new Player(p1Button.value, p1Button.name);
    let p2 = new Player(p2Button.value, p2Button.name);

    new Game(p1, p2);
  }
  else {return}
});

// OnClick - force page reload, resetting game //
resetButton.addEventListener('click', (e) => {
  location.reload();
});

// OnClick - creates game instanc with playerOne and Computer as a player //
compButton.addEventListener('click', (e) => {
  if (gameStart === 0) {
    gameStart++;
    introDiv.remove();
      
    let p1 = new Player(p1Button.value, p1Button.name);
    let p2 = new Computer(compButton.value, compButton.name);

    new Game(p1, p2);
  }
  else {return}
});
  

