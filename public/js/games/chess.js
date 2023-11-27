const socket3 = io.connect();



var chessGame = null
var view = null

const id = document.getElementById("userIdInput").value;
const name = document.getElementById("userNameInput").value;
const imageUrl = document.getElementById("imageUrlInput").value;
let mySymbol = ''
const gameId = document.getElementById("gameIdInput").value;

socket3.on("connect", () => {
  console.log("Connected to server");
  socket3.emit("JoinChessGame", {userId:id,userName:name, imageUrl, gameId, gameLink:document.getElementById('gameLinkInput').value});

});

// JavaScript for client-side logic
// Function to handle game events on the client side
socket3.on("gameDetails", ({players}) => {
    let playersString = ''
    players.forEach((player, index)=>{
      var perspective = player.symbol;
      if(player.userId == id){
        if(perspective === 'BLACK'){
          document.getElementById("black-perspective").checked = true
        }
        mySymbol = player.symbol
      var initialTurn = "WHITE";
        playersString += `
        <div class="center column">
        <img src=${player.imageUrl}>
        <div>Me-${perspective}</div>
        </div>`
        if(!chessGame){
          chessGame = new Game(Utils.getInitialPieces(), initialPositions, initialTurn);
          view = new View(document.getElementById("board"), chessGame, perspective);
          const control = new Control(chessGame, view);
          // control.autoplay();
        }
        // setTimeout(()=>{
        //   chessGame.move('D2', {row: '3', col: 'D'}, false)
        //   view.handleTileClick( {row: '', col: ''});
        // },2000)
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


socket3.on("updateChessBoard", ({pieceId ,location, capture,senderId}) => {
  
 console.log(senderId)
 console.log(socket3.id)
 console.log(chessSocket.id)

  
  chessGame.recieveMove(pieceId, location, capture);
  view.handleTileClick(location); // Update the view after the move


});