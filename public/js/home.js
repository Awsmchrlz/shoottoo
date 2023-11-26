const socket = io();

socket.on("message", (data) => {
  displayMessage(data);
});

socket.on("initialMessages", (messages) => {
  messages.forEach((message) => {
    setTimeout(()=>{

      displayMessage(message);
    },200) 
  });
});

socket.on("initialGames", (games) => {
  games.forEach((game) => {
    setTimeout(()=>{
      displayGame(game);

    },200) 
  });
});

socket.on('newPublicGame', (game)=>{
  displayGame(game)
})


function displayGame(game) {
    const gamesContainer = document.getElementById("chatMessagesContainer");
    const gameDiv = document.createElement("div");
  gameDiv.classList.add('game-card');

    gameDiv.innerHTML = `
    
    
            <h2>${ game.roomName }</h2>
            <p class="game-type">${ game.gameType }</p>
            <p><strong>Players:</strong> ${ game.players.length }/${ game.maxPlayers }</p>
            <p><strong>Stake Per Game:</strong> K${ game.stakePerGame }</p>
            <p><strong>Private:</strong> ${ game.isPrivate ? 'Yes' : 'No' }</p>
            <!-- Add more game details as needed -->
            <form action="/game/joingame" method="post">
                <input type="hidden" name="gameLink" value="${game.gameLink}">
                <button class="join-button">Join Game</button>
            </form>
        
  
  `

    gamesContainer.appendChild(gameDiv);
    // Scroll to the bottom to show the latest games
    gamesContainer.scrollTop = gamesContainer.scrollHeight;
  }
  
const userId = document.getElementById("userId").value;

function sendMessage() {
  const message = document.getElementById("messageInput").value;
  const senderName = document.getElementById("senderName").value;
  const imageUrl = document.getElementById("imageUrl").value;

  if (message.trim() !== "") {
    socket.emit("message", { message, senderName, imageUrl, userId });
    messageInput.value = "";
  }
}


setInterval(updateTimestamps, 3000); // Update every minute

function updateTimestamps() {
  const timestampElements = document.querySelectorAll('.timestamp');
  timestampElements.forEach((element) => {
    const timestamp = parseInt(element.dataset.timestamp, 10);
    element.textContent = timeAgo(timestamp);
  });
}



function displayMessage(data) {
  const isMe = data.userId === userId; // Assuming userId is a global variable representing your own user ID
  const areFriends = checkIfFriends(userId, data.userId);
 
  const messagesContainer = document.getElementById("chatMessagesContainer");
  const messageSpan = document.createElement("span");

  messageSpan.classList.add("center");
  messageSpan.innerHTML = `
  <span class="center">
  <div class="message-container">
    <form class="message-header" method="post" action="/manageFriend">
      <div class="sender-info">
        <div class="sender-image">
          <img src="${data.imageUrl}" alt="imageurl">
        </div>
        <div class="sender-name">${isMe ? 'Me' : data.senderName}</div>
      </div>
      <input type="hidden" name="friendId" value="${data.userId}" />
      ${
        areFriends
          ? `<button type="submit" class="remove-friend-button" onclick="removeFriend('${data.userId}')">Remove Friend</button>`
          : isMe ?''
           :`<button type="submit" class="add-friend-button" onclick="sendFriendRequest('${data.userId}')">Add Friend</button>`
      }
    </form>
    
    <div class="message-body">
    <p>${data.message}</p>
  </div>
  <div class="timestamp" data-timestamp="${data.timeStamp}">${timeAgo(data.timeStamp)}</div>

  </div>
</span>
`;
  messagesContainer.appendChild(messageSpan);
  // Scroll to the bottom to show the latest messages
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function timeAgo(timestamp) {
  const now = getCurrentTimestamp();
  const seconds = now - timestamp;

  // Helper function to calculate pluralize
  const pluralize = (count, noun) =>
    count === 1 ? `${count} ${noun}` : `${count} ${noun}s`;

  if (seconds < 60) {
    return pluralize(seconds, "second") + " ago";
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return pluralize(minutes, "minute") + " ago";
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return pluralize(hours, "hour") + " ago";
  } else {
    const days = Math.floor(seconds / 86400);
    return pluralize(days, "day") + " ago";
  }
}

function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000); // Convert to seconds
}

// room name generator
class RoomNameGenerator {
  constructor(adjectives, nouns) {
    this.adjectives = adjectives;
    this.nouns = nouns;
  }

  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  generateRoomName() {
    const adjective = this.getRandomElement(this.adjectives);
    const noun = this.getRandomElement(this.nouns);
   
    return `${adjective} ${noun}`;
  }
}

// Extended arrays of adjectives and nouns
const adjectives = [
  'Mystic', 'Electric', 'Golden', 'Crystal', 'Ancient',
  'Whimsical', 'Enchanted', 'Radiant', 'Ethereal', 'Dazzling',
  'Vibrant', 'Celestial', 'Serene', 'Mythical', 'Spectral',
  'Luminous', 'Tranquil', 'Astral', 'Harmonious', 'Epic'
];
const nouns = [
  'Castle', 'Labyrinth', 'Realm', 'Citadel', 'Sanctuary',
  'Oracle', 'Haven', 'Chamber', 'Domain', 'Emporium',
  'Fortress', 'Grove', 'Enclave', 'Refuge', 'Hideaway',
  'Oasis', 'Eden', 'Shrine', 'Expanse', 'Abyss'
];


// Generate a room name



// Initialize the generator
const generator = new RoomNameGenerator(adjectives, nouns);

const roomNameInput = document.getElementById('roomNameInput')
const roomName = document.getElementById('roomName')

var randomRoomName = generator.generateRoomName();

roomName.innerHTML = randomRoomName;
roomNameInput.value = randomRoomName;


const randomizeRoomName = document.getElementById('randomizeRoomName')

randomizeRoomName.addEventListener('click',()=>{
randomRoomName = generator.generateRoomName();
  roomName.innerHTML = randomRoomName;
roomNameInput.value = randomRoomName;
})

const maximizeMessages = document.getElementById('maximizeContentBox')

maximizeMessages.addEventListener('click',()=>{
  console.log('dsd')
  document.querySelector('.chatMessagesContainer').classList.add('reversing')
  document.querySelector('.chatMessagesContainer').classList.add('is-expanded')
  
  

  
})
















