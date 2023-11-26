# shoottoo
multiplayer cards game
       const gameLink = document.getElementById("gameLinkInput").value;

    chessSocket.emit('ChessMove',{gameLink,pieceId ,location, capture})
