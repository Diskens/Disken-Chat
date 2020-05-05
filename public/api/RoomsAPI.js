
function API_CreateRoom(owner, name, isPublic, history) {
  $SOCKET.emit('CreateRoom', {owner, name, isPublic, history});
}
function On_CreateRoom(data) {
  if (data.success) popup('Room created successfully');
  else popup('Room could not be created');
}
$SOCKET.on('CreateRoom', On_CreateRoom);


function API_JoinRoom(username, roomName, passcode) {
  $SOCKET.emit('JoinRoom', {username, roomName, passcode});
}
function On_JoinRoom(data) {
  if (!data.success) { popup('Could not join room'); return; }
  popup(`Joined room ${data.room.name}`);
  var container = $id('HomeSubRooms').childNodes[2];
  var room = new Room(data);
  API_SetRoomUserStatus($USER.username, room.ID, 'away');
  $APP.rooms[room.ID] = room;
  var entry = RoomCreator.createListingEntry(room, () => {$APP.showRoom(room.ID);});
  container.appendChild(entry);
}
$SOCKET.on('JoinRoom', On_JoinRoom);


function On_NewRoomMember(data) {
  var room = $APP.rooms[data.roomID];
  room.addUser()
}
$SOCKET.on('NewRoomMember', On_NewRoomMember);


function API_GetUserRooms(username) {
  $SOCKET.emit('GetUserRooms', {username});
}
function On_GetUserRooms(data) {
  $APP.onUserRoomsLoaded(data.rooms);
}
$SOCKET.on('GetUserRooms', On_GetUserRooms);


function API_SetRoomUserStatus(username, roomID, status) {
  $SOCKET.emit('RoomUserStatus', {username, roomID, status});
}
function On_RoomUserStatus(data) {
  if (!$APP.initalized) return; // TODO
  // If multiple users refresh page at once their status will not be received
  // as the object where data is stored, is not yet created
  $APP.rooms[data.roomID].onUserStatus(data);
}
$SOCKET.on('RoomUserStatus', On_RoomUserStatus);


function API_SendMessage(username, roomID, content) {
  $SOCKET.emit('Message', {username, roomID, content});
}
function On_Message(data) {
  $APP.room.onMessage(data);
}
$SOCKET.on('Message', On_Message);


function API_SendReaction(username, roomID, messageID) {
  $SOCKET.emit('Reaction', {username, roomID, ID:messageID});
}
function On_Reaction(data) {
  $APP.room.onReaction(data);
}
$SOCKET.on('Reaction', On_Reaction);


function API_GetChatHistory(username, roomID) {
  $SOCKET.emit('GetChatHistory', {username, roomID});
}
function On_ChatHistory(data) {
  $APP.room.onChatHistory(data);
}
$SOCKET.on('ChatHistory', On_ChatHistory);


function API_ResetPasscode(roomID) {
  $SOCKET.emit('ResetPasscode', {roomID});
}
function On_ResetPasscode(data) {
  $APP.rooms[data.roomID].newPasscode(data.passcode);
}
