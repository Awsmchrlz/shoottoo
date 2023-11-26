var gameSocket = io();
gameSocket.on("GameMessage", (data) => {
  if(data.message){
    displayMessage(data);
  }
});

gameSocket.on("updatePlayers", (data) => {
  updatePlayers(data);
});

const link = document.getElementById("gameLinkInput").value;

const userId = document.getElementById("userIdInput").value;
const userName = document.getElementById("userNameInput").value;
gameSocket.emit("JoinSocket",{ gameLink: link})

function sendMessage() {
  const messageInput = document.getElementById("gameMessageInput");
  const message = document.getElementById("gameMessageInput").value;

  if (message.trim() !== "") {
    gameSocket.emit("GameMessage", { message, userName, gameLink: link });
    messageInput.value = "";
  }
}

function displayMessage(data) {
  const messagesContainer = document.getElementById("gameMessages");
  const messageSpan = document.createElement("span");

  messageSpan.classList.add("center");
  messageSpan.innerHTML = `
  
  <div>
    <p><strong>${data.userName}</strong>: ${data.message}</p>
  </div>

`;
  messagesContainer.appendChild(messageSpan);
  // Scroll to the bottom to show the latest messages
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updatePlayers(players) {
  const playersContainer = document.getElementById("gamePlayers");

  playersContainer.innerHTML = "";
  const playersSpan = document.createElement("span");
  players.forEach((player) => {
    playersSpan.classList.add("center");
    playersSpan.innerHTML = `
  
<img src=${player.imageUrl}>
    <p>${player.userName}</p>
  

`;
    playersContainer.appendChild(playersSpan);
  });
  // Scroll to the bottom to show the latest messages
}

const sendMessageButton = document.getElementById("sendGameMessage");

sendMessageButton.addEventListener("click", async () => {
  try {
    sendMessage();
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
});


const copyButton = document.getElementById("copyGameLink");

copyButton.addEventListener("click", async () => {
  const gameLink = document.getElementById('gameLinkInput').value
  try {
    await navigator.clipboard.writeText(gameLink);
    copyButton.innerText = "Copied";
  } catch (err) {
    console.error("Failed to copy: ", err);
    copyButton.innerText = "Error Copy Manually";
  }
});


gameSocket.on("gameDetails", ({players}) => {
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
