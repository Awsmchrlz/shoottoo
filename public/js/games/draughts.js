const socket3 = io.connect();



var checkersGame = null
var view = null

const id = document.getElementById("userIdInput").value;
const name = document.getElementById("userNameInput").value;
const imageUrl = document.getElementById("imageUrlInput").value;
let mySymbol = ''
const gameId = document.getElementById("gameIdInput").value;

socket3.on("connect", () => {
  console.log("Connected to server");
  socket3.emit("joinCheckersGame", {userId:id,userName:name, imageUrl, gameId, gameLink:document.getElementById('gameLinkInput').value});

});

// JavaScript for client-side logic
// Function to handle game events on the client side
socket3.on("gameDetails", ({players}) => {
    let playersString = ''
    players.forEach((player, index)=>{
      var perspective = player.symbol;
      if(player.userId == id){
       ySymbol = player.symbol
      var initialTurn = "WHITE";
        playersString += `
        <div class="center column">
        <img src=${player.imageUrl}>
        <div>Me-${perspective}</div>
        </div>`
        if(!checkersGame){
           checkersGame = new Checkers();
          
            for (const square of checkersGame.squares) {
              square.addEventListener('click', () => checkersGame.handleClick(square));
            }
        
        }
       
    }else{
    
       playersString += ` 
        <div class="center column">
        <img src=${player.imageUrl}>
        <div>${player.userName}-${perspective}</div>
        </div>`
    }
    index<(players.length-1)?playersString += '<span>Vs</span>':''
  })
  console.log(players)
  document.getElementById("gamePlayers").innerHTML = `${playersString}`;

});


socket3.on("UpdateCheckersBoard", (moveData) => {
  
//  console.log('qwqwqw',targetSquare)
//  console.log(socket3.id)
//  console.log(checkersSocket.id)

 checkersGame.handleOpponentMove(moveData);
});