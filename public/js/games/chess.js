const socket3 = io.connect();



var chessGame = null
var startGame = false
var view = null

const id = document.getElementById("userIdInput").value;
const name = document.getElementById("userNameInput").value;
const imageUrl = document.getElementById("imageUrlInput").value;
let mySymbol = ''
const gameId = document.getElementById("gameIdInput").value;

var initialTurn = "WHITE";
var myPerspective = ''      

socket3.on("connect", () => {
  console.log("Connected to server");
  socket3.emit("JoinChessGame", {userId:id,userName:name, imageUrl, gameId, gameLink:document.getElementById('gameLinkInput').value});

});

// JavaScript for client-side logic
// Function to handle game events on the client side
socket3.on("gameDetails", ({players, paidPlayers,stake}) => {
    let playersString = ''
    let paidPlayersString = ''
    let haveBothPaid = paidPlayers.length === 2

    if(paidPlayers.includes(id)){
      document.getElementById("gameTransactionModal").classList.remove("active")
      document.getElementById("overLay").classList.remove("active")
      
      
        document.getElementById("gameLinkModal").classList.add("active")
      document.getElementById("overLay").classList.add("active")
   
    }else{
      document.getElementById("gameTransactionModal").classList.add("active")
      document.getElementById("overLay").classList.add("active")
      
    }

   
    

    players.forEach((player, index)=>{
      var perspective = player.symbol;
     
      if(player.userId == id){
        myPerspective = player.symbol;
        if(perspective === 'BLACK'){
          document.getElementById("black-perspective").checked = true
        }
        if(paidPlayers.includes(player.userId)){
          paidPlayersString += ` ${player.userName} Waged <span> k${stake}</span>`
      
        }

        mySymbol = player.symbol
    
        playersString += `
        <div class="center column">
        <img src=${player.imageUrl}>
        <div>Me-${perspective}</div>
        </div>`
      
        if(haveBothPaid){
           
          document.getElementById("gameLinkModal").classList.remove("active")
console.log("both paid")
      
      document.querySelector("#startGameModal.modal").classList.add("active")
      document.getElementById("overLay").classList.add("active") 

        }
     
    }else{
    
      if(paidPlayers.includes(player.userId)){
        paidPlayersString += ` ${player.userName} Waged <span> k${stake} </span>`
      }

       playersString += ` 
        <div class="center column">
        <img src=${player.imageUrl}>
        <div>${player.userName}-${perspective}</div>
        </div>`
    }
    index<(players.length-1)?playersString += '<span> Vs </span>':''
  })
  document.getElementById('paidPlayers').innerHTML = paidPlayersString
  // console.log(players)
  document.getElementById("gamePlayers").innerHTML = `${playersString}`;

});


socket3.on("updateChessBoard", ({pieceId ,location, capture,senderId}) => {
  
 console.log(senderId)
 console.log(socket3.id)
 console.log(chessSocket.id)

  
  chessGame.recieveMove(pieceId, location, capture);
  view.handleTileClick(location); // Update the view after the move


});

socket3.on("beginGame",()=>{
  console.log("sds")
  if(!chessGame){
    chessGame = new Game(Utils.getInitialPieces(), initialPositions, initialTurn);
    view = new View(document.getElementById("board"), chessGame, myPerspective);
    const control = new Control(chessGame, view);
   
    // control.autoplay();
  }
})