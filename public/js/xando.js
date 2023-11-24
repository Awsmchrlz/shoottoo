


// Game class
class Game {
  constructor() {
    this.board = Array(9).fill(null); // Represents the Tic Tac Toe board
    this.players = []; // Array to store player information
    this.currentPlayer = 0; 
    
}

  // Add a player to the game
  addPlayer(player) {
    this.players.push(player);
  }

  // Perform a move on the board
  makeMove(index, userId) {
    console.log(this)

    if (this.isValidMove(index, userId)) {

      this.board[index] = this.players[this.currentPlayer].symbol;
      this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    
      return true;
    }
    return false;
  }

  // Check if the move is valid
  isValidMove(index, id) {
    if(this.players.length != 2){
return false;
    }
    //check if its the correct players turn
    const currentPlayerId = this.players[this.currentPlayer].userId

    if(id != currentPlayerId){
return false
    }
    return this.board[index] === null;
  }

  // Check if there's a winner
  checkWinner() {
    // Logic to check for a winning combination on the board
    // Return the winning player or null if there's no winner
  }
}

// Player class
class Player {
  constructor({id, symbol, userName, imageUrl}) {
    this.id = id; // Player's unique identifier
    this.symbol = symbol; // Symbol for the player (e.g., 'X' or 'O')
    this.userName = userName
    this.imageUrl = imageUrl
}
}

// Client-side logic (Assuming usage in a browser environment)
const socket2 = io.connect();
let game = null;

const id = document.getElementById("userIdInput").value;
const name = document.getElementById("userNameInput").value;
const imageUrl = document.getElementById("imageUrlInput").value;
let mySymbol
const gameId = document.getElementById("gameIdInput").value;

socket2.on("connect", () => {
  console.log("Connected to server");
  socket2.emit("joinGame", {userId:id,userName:name, imageUrl, gameId});
});

// JavaScript for client-side logic
// Function to handle game events on the client side
socket2.on("gameDetails", ({players}) => {
    let playersString = ''
  if(!game){
    game = new Game();
  }
  initializeBoard(game.board);
  game.players = players
  players.forEach((player, index)=>{
    if(player.userId == id){
        mySymbol = player.symbol
        playersString += `
        <div class="center column">
        <img src=${player.imageUrl}>
        <div>Me-${player.symbol}</div>
        </div>`
    }else{

        playersString += ` 
        <div class="center column">
        <img src=${player.imageUrl}>
        <div>${player.userName}-${player.symbol}</div>
        </div>`
    }
    index<(players.length-1)?playersString += '<span>Vs</span>':''
  })
  console.log(players)
  document.getElementById("gamePlayers").innerHTML = `${playersString}`;

});

socket2.on("updateBoard", ({ userId, symbol,index}) => {
    game.makeMove(index, userId)
  updateBoard(game.board);

});

// Function to initialize the game board UI
function initializeBoard(board) {
  const gameBoard = document.getElementById("gameBoard");
  gameBoard.innerHTML = "";

  board.forEach((cell, index) => {
    const cellElement = document.createElement("div");
    cellElement.classList.add("cell");
    cellElement.innerText = cell === null ? "" : cell;
    cellElement.addEventListener("click", () => handleMove(index));
    gameBoard.appendChild(cellElement);
  
});
}

// Function to update game board UI
function updateBoard(board) {
    console.log(board)
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell, index) => {
    cell.innerText = board[index] === null ? "" : board[index];
  });
}

// Function to handle user interaction and emit events to the server
function handleMove(index) {
  const player = "X"; // Replace with actual player identification
  const encryptedMove = encryptMove(index, player);
  socket2.emit("makeMove", {userId, index, symbol:mySymbol});
}

// Functions to encrypt and decrypt moves
function encryptMove(index, player) {
  const moveString = `${index}:${player}`;
  // Replace the following line with a secure encryption method in production
  return btoa(moveString); // Using Base64 encoding for demonstration
}

function decryptMove(encryptedMove) {
  // Replace the following line with a secure decryption method in production
  const decryptedMove = atob(encryptedMove); // Using Base64 decoding for demonstration
  const [index, player] = decryptedMove.split(":");
  return { index: parseInt(index), player };
}
