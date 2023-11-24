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
