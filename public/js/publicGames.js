const socket = io.connect('http://localhost:3000');

socket.on('newPublicGame', (game)=>{
  displayGame(game)
})



function displayGame(game) {
    const gamesContainer = document.getElementById("gamesContainer");
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
  