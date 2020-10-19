
class RoomsManager {
  constructor() {
    this.rooms = {}
    this.current = '';
    // Rooms management
    SOCKET.on('GetUserRooms', (data)=>{this.onGetUserRooms(data);});
    SOCKET.on('CreateRoom', (data)=>{this.onCreateRoom(data);});
    // Room specific
    SOCKET.on('GetChatEntries', (data)=>{this.onGetChatEntries(data);});
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

  /* MANAGEMENT SOCKETIO INTERFACE */

  getUserRooms() {
    SOCKET.emit('GetUserRooms', {username:USER.get().username,
      sessionID:SOCKET.id});
  }
  onGetUserRooms(data) {
    if (!data.success) {
      Popup.create(`Could not load rooms list (${data.reason})`);
      return;
    }
    let list = $id('RoomList').querySelector('.list');
    for (let roomData of data.rooms) {
      this.rooms[roomData._id] = new Room(this, roomData);
      // Create DOM list entry
      let container = $create('div');
      container.classList.add('listing');
      container.onclick = ()=>{ROOMS.gotoRoom(roomData._id);};
      list.appendChild(container);
      let label = $create('p');
      label.innerText = roomData.name;
      container.appendChild(label);
      let clear = $create('div');
      clear.classList.add('clear');
      container.appendChild(clear);
    }
  }

  createRoom() {
    SOCKET.emit('CreateRoom', {
      username: USER.get().username,
      sessionID: SOCKET.id,
      name: $id('CreateName').value,
      makeVisible: $id('CreateMakeVisible').checked,
      requirePasscode: $id('CreateRquirePasscode').checked,
    });
  }
  onCreateRoom(data) {
    if (!data.success) {
      Popup.create(`Could not create room (${data.reason})`);
      return;
    }
    Popup.create(`Created room (${data.name})`);
  }

  /* ROOM SPECIFIC SOCKETIO INTERFACE */

  getChatEntries(roomID, lastMessage='latest') {
    SOCKET.emit('GetChatEntries', {
      username: USER.get().username,
      sessionID: SOCKET.id,
      roomID, lastMessage
    });
  }
  onGetChatEntries(data) {
    if (!data.success) {
      Popup.create(`Could not load chat data (${data.reason})`);
      return;
    }
    this.rooms[data.roomID].entries.prepend(data.entries);
  }

  markMemberStatus(roomID) {
    //
  }
}
