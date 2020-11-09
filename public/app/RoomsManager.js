
class RoomsManager {
  constructor() {
    this.rooms = {}
    this.current = '';
    // Rooms management
    SOCKET.on('GetUserRooms', (data)=>{this.onGetUserRooms(data);});
    SOCKET.on('CreateRoom', (data)=>{this.onCreateRoom(data);});
    SOCKET.on('JoinRoom', (data)=>{this.onJoinRoom(data);});
    // Room specific
    SOCKET.on('GetChatEntries', (data)=>{this.onGetChatEntries(data);});
    SOCKET.on('NewEntry', (data)=>{this.onNewEntry(data);});
    SOCKET.on('GetRoomUsernames', (data)=>{this.onGetRoomUsernames(data);});
    SOCKET.on('NewMember', (data)=>{this.onNewMember(data);})
  }
  gotoRoom(id) {
    this.current = id;
    this.rooms[id].show();
    swRoom.goto('chat');
  }
  leaveRoom() {
    this.rooms[this.current].hide();
    swRoom.goto('list');
  }
  purge() {
    swRoom.goto('list');
    for (let room of Object.values(this.rooms)) room.dom.purge();
    this.rooms = {};
    this.current = '';
  }

  /* MANAGEMENT SOCKETIO INTERFACE */

  getUserRooms(userTriggered=false) {
    SOCKET.emit('GetUserRooms', {userID:USER.get().ID,
      sessionID:SOCKET.id, userTriggered});
  }
  onGetUserRooms(data) {
    if (!data.success) {
      Popup.create(`Could not load rooms list (${data.reason})`);
      return;
    }
    if (data.userTriggered)
      Popup.create('Refreshed');
    let list = $id('RoomListContainer');
    $empty(list);
    for (let roomData of data.rooms) {
      this.rooms[roomData.ID] = new Room(this, roomData);
      // Request usernames
      this.getRoomUsernames(roomData.ID);
      // Create DOM list entry
      let container = $create('div');
      container.classList.add('listing');
      container.onclick = ()=>{ROOMS.gotoRoom(roomData.ID);};
      list.appendChild(container);
      let label = $create('p');
      label.innerText = roomData.name;
      container.appendChild(label);
      let clear = $create('div');
      clear.classList.add('clear');
      container.appendChild(clear);
    }
  }

  getRoomUsernames(roomID) {
    SOCKET.emit('GetRoomUsernames', {userID:USER.get().ID, roomID,
      sessionID:SOCKET.id});
  }
  onGetRoomUsernames(data) {
    if (!data.success) {
      Popup.create(`Could not load usernames dictionary (${data.reason})`);
      return;
    }
    this.rooms[data.roomID].members.setUsernames(data.usernames);
  }

  createRoom() {
    SOCKET.emit('CreateRoom', {
      userID: USER.get().ID,
      sessionID: SOCKET.id,
      name: $id('CreateName').value,
      makeVisible: $id('CreateMakeVisible').checked,
      requirePasscode: $id('CreateRquirePasscode').checked,
    });
    $id('CreateName').value = '';
  }
  onCreateRoom(data) {
    if (!data.success) {
      Popup.create(`Could not create room (${data.reason})`);
      return;
    }
    Popup.create(`Created room (${data.name})`);
  }

  joinRoom() {
    SOCKET.emit('JoinRoom', {
      userID: USER.get().ID,
      sessionID: SOCKET.id,
      name: $id('JoinName').value,
      passcode: $id('JoinPasscode').value,
    });
    $id('JoinPasscode').value = '';
  }
  onJoinRoom(data) {
    if (!data.success) {
      Popup.create(`Could not join room (${data.reason})`);
      return;
    }
    Popup.create(`Joined room (${data.name}). Please refresh your rooms list`);
  }

  /* ROOM SPECIFIC SOCKETIO INTERFACE */

  getChatEntries(roomID, lastMessage='latest') {
    SOCKET.emit('GetChatEntries', {
      userID: USER.get().ID,
      sessionID: SOCKET.id,
      roomID, lastMessage
    });
  }
  onGetChatEntries(data) {
    if (!data.success) {
      Popup.create(`Could not load chat data (${data.reason})`);
      return;
    }
    this.rooms[data.roomID].entries.prependMany(data.entries);
    this.rooms[data.roomID].dom.scrollDown();
  }

  newEntry(roomID, etype, content) {
    SOCKET.emit('NewEntry', {
      userID: USER.get().ID,
      sessionID: SOCKET.id,
      roomID, etype, content
    });
  }
  onNewEntry(data) {
    if (data.error) {
      Popup.create(`Could not send message (${data.reason})`);
      return;
    }
    this.rooms[data.roomID].entries.append(data.entry);
  }

  onNewMember(data) {
    this.rooms[data.roomID].members.addMember(data.userID, data.username);
  }
}
