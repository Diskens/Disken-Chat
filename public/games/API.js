
// Get all in-lobby games
function API_GetAvailableGames() {
  console.log('Sending "GetAvailableGames"');
  $SOCKET.emit('GetAvailableGames', {});
}
function Re_GetAvailableGames(data) {
  console.log('Received "Re_GetAvailableGames"', data);
  showLobbies(data.games);
}
$SOCKET.on('Re_GetAvailableGames', Re_GetAvailableGames);


// Create new game
function API_CreateGame(maxPlayers, mapID) {
  console.log('Creating a game');
  $SOCKET.emit('CreateGame', {maxPlayers, mapID});
}
function Re_CreateGame(data) {
  console.log('Received "Re_CreateGame"', data);
  if (!data.success) { popupError(data.reason); return; }
  popupMessage('Game was created successfully');
}
$SOCKET.on('Re_CreateGame', Re_CreateGame);


// Restore game after reload
function API_RestoreGame(username, sessionID) {
  console.log('Restoring game after page reload');
  $SOCKET.emit('RestoreGame', {username, sessionID});
}
function Re_RestoreGame(data) {
  console.log('Received "Re_RestoreGame"', data);
  if (data.success) {
    $GAME = new Game(data.game);
    switchSection('lobby');
  } else {
    popupError(data.reason);
    $PLAYER = data.player;
    return; }
}
$SOCKET.on('Re_RestoreGame', Re_RestoreGame);


// Join game
function API_JoinLobby(username, gameID) {
  console.log(`Request to join #${gameID} was sent`);
  $SOCKET.emit('JoinLobby', {username, gameID});
}
function Re_JoinLobby(data) {
  console.log('Received "Re_JoinLobby"', data);
  if (!data.success) { popupError(data.reason); return; }
  $GAME = new Game(data.game);
  $PLAYER = data.player;
  switchSection('lobby');
}
$SOCKET.on('Re_JoinLobby', Re_JoinLobby);


// Chat messages
function API_ChatMessage(sessionID, username, gameID, text) {
  $SOCKET.emit('ChatMessage', {sessionID, username, gameID, text});
}
function Re_ChatMessage(data) {
  console.log(`[Chat] ${data.username}: ${data.text}`);
  $GAME.onNewMessage(data.username, data.text);
}
$SOCKET.on('Re_ChatMessage', Re_ChatMessage);


// Chat announcements (join, leave etc)
function API_ChatAnnouncement(gameID, username, type) {
  $SOCKET.emit('ChatAnnouncement', {gameID, username, type});
}
function Re_ChatAnnouncement(data) {
  console.log(`[Chat] New announcement`, data);
  $GAME.onNewAnnouncement(data.type, data.text);
}
$SOCKET.on('Re_ChatAnnouncement', Re_ChatAnnouncement);


// Leave game
function API_LeaveLobby(username, gameID) {
  console.log(`Leaving #${gameID}`);
  $SOCKET.emit('LeaveLobby', {username, gameID});
}
function Re_LeaveLobby(data) {
  console.log('Received "Re_LeaveLobby"', data);
  $GAME = null;
  $PLAYER.inGame = false;
  switchSection('home');
}
$SOCKET.on('Re_LeaveLobby', Re_LeaveLobby);
