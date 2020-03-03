/* --------------------------------
/ Matchmaking
/ -------------------------------- */

// Get all rooms
function API_GetAvailableRooms() {
  console.log('Sending "GetAvailableRooms"');
  $SOCKET.emit('GetAvailableRooms', {username:$USER.username});
}
function Re_GetAvailableRooms(data) {
  console.log('Received "Re_GetAvailableRooms"', data);
  showRooms(data.rooms);
}
$SOCKET.on('Re_GetAvailableRooms', Re_GetAvailableRooms);


// Create new room
function API_CreateRoom(maxUsers, mapID) {
  console.log('Sending "CreateRoom"');
  $SOCKET.emit('CreateRoom', {maxUsers, mapID});
}
function Re_CreateRoom(data) {
  console.log('Received "Re_CreateRoom"', data);
  if (!data.success) { popupError(data.reason); return; }
  popupMessage('Room was created successfully');
}
$SOCKET.on('Re_CreateRoom', Re_CreateRoom);


// Restore room after reload
function API_RestoreRoom(username, sessionID) {
  console.log('Sending "RestoreRoom"');
  $SOCKET.emit('RestoreRoom', {username, sessionID});
}
function Re_RestoreRoom(data) {
  console.log('Received "Re_RestoreRoom"', data);
  if (data.success) {
    $ROOM = new Room(data.room);
    $ROOM.attachRoomDOM();
    autoSwitchPlayButton();
    switchSection('room');
  } else {
    popupError(data.reason);
    $USER = data.user;
  }
}
$SOCKET.on('Re_RestoreRoom', Re_RestoreRoom);


// Join room
function API_JoinRoom(username, roomID) {
  console.log('Sending "JoinRoom"');
  $SOCKET.emit('JoinRoom', {username, roomID});
}
function Re_JoinRoom(data) {
  console.log('Received "Re_JoinRoom"', data);
  if (!data.success) { popupError(data.reason); return; }
  $USER = data.user;
  $ROOM = new Room(data.room);
  $ROOM.attachRoomDOM();
  switchSection('room');
  autoSwitchPlayButton();
}
$SOCKET.on('Re_JoinRoom', Re_JoinRoom);


// Leave room
function API_LeaveRoom(username, roomID) {
  console.log('Sending "LeaveRoom"');
  $SOCKET.emit('LeaveRoom', {username, roomID});
}
function Re_LeaveRoom(data) {
  console.log('Received "Re_LeaveRoom"', data);
  $ROOM.chat.clearHistory();
  $ROOM.slotsDom.removeAll();
  $ROOM = null;
  $USER.inRoom = false;
  autoSwitchPlayButton();
  switchSection('home');
}
$SOCKET.on('Re_LeaveRoom', Re_LeaveRoom);


// Users state updates
function API_StatusUpdate(what, data) {
  console.log('Sending "StatusUpdate"');
  $SOCKET.emit('StatusUpdate', {
    sessionID:$SOCKET.id, username:$USER.username, room:$ROOM.ID, what, data});
}
function Re_StatusUpdate(data) {
  $ROOM.onStatusUpdate(data);
}
$SOCKET.on('Re_StatusUpdate', Re_StatusUpdate);


/* --------------------------------
/ Chat
/ -------------------------------- */

// Chat messages
function API_ChatMessage(sessionID, username, roomID, text) {
  console.log('Sending "ChatMessage"');
  $SOCKET.emit('ChatMessage', {sessionID, username, roomID, text});
}
function Re_ChatMessage(data) {
  console.log(`[Chat] ${data.username}: ${data.text}`);
  $ROOM.chat.newMessage(data.username, data.text);
}
$SOCKET.on('Re_ChatMessage', Re_ChatMessage);
