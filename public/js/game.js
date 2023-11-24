
const socket = io();

socket.on("gameMessage", (data) => {
  displayMessage(data);
});

socket.on("updatePlayers", (data) => {
  updatePlayers(data)
});




const userId = document.getElementById("userIdInput").value;
const userName = document.getElementById("userNameInput").value;

function sendMessage() {
  const messageInput = document.getElementById("gameMessageInput");
  const message = document.getElementById("gameMessageInput").value;
  
  if (message.trim() !== "") {
    socket.emit("gameMessage", { message, userName });
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



function updatePlayers(players){
  const playersContainer = document.getElementById("gamePlayers");
 
  playersContainer.innerHTML = ''
  const playersSpan = document.createElement("span");
players.forEach(player => {
  
  playersSpan.classList.add("center");
  playersSpan.innerHTML = `
  
<img src=${player.imageUrl}>
    <p>${player.userName}</p>
  

`;
  playersContainer.appendChild(playersSpan);
});
  // Scroll to the bottom to show the latest messages
  
}

const sendMessageButton = document.getElementById('sendGameMessage');

sendMessageButton.addEventListener('click', async () => {

  try {
    sendMessage();
    
  } catch (err) {
    console.error('Failed to copy: ', err);

  }
});



  const copyButton = document.getElementById('copyGameLink');

  copyButton.addEventListener('click', async () => {
    const gameLink = document.getElementById('gameLinkInput').value
  
    try {
      await navigator.clipboard.writeText(gameLink);
      copyButton.innerText = 'Copied'
    } catch (err) {
      console.error('Failed to copy: ', err);
      copyButton.innerText = 'Error Copy Manually'
    }
  });


