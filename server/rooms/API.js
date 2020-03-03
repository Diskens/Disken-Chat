var meta, common, current;

exports.RoomsApi = class RoomsApi {
  constructor(data) {
    meta = data.meta; common = data.common; current = data.current;
    this.map = {
      GetAvailableRooms: this.getAvailableRooms,
      CreateRoom: this.createRoom,
      RestoreRoom: this.restoreRoom,
      JoinRoom: this.joinRoom,
      LeaveRoom: this.leaveRoom,
      ChatMessage: this.chatMessage
    }
  }

  async getAvailableRooms(socket, data) {
    console.log(`[Rooms] ${data.username} requested available rooms`);
    var result = await current.rooms.getAvailableRooms();
    socket.emit('Re_GetAvailableRooms', {rooms:result});
  }
  async createRoom(socket, data) {
    console.log(`[Rooms] Creating a new room`);
    var result = await current.rooms.createRoom(data.maxUsers, data.mapID);
    socket.emit('Re_CreateRoom', result);
  }
  async restoreRoom(socket, data) {
    var user = await current.accounts.getByUsername(data.username);
    var room = await current.rooms.getByID(user.roomID);
    var result = {success:true};
    if (user.sessionID != data.sessionID)
      result = {success:false, reason:'Your session ID does not match'};
    if (room == undefined)
      result = {success:false, reason:'Room no longer exists'};
    if (!room.users.includes(user.username))
      result = {success:false, reason:'You no longer are connected to this room'};
    if (result.success) {
      result.room = room;
      console.log(`[Rooms] ${data.username} is back in #${room.ID}`);
      current.activeClients[socket.id] = socket;
      socket.join(`#${room.ID}`);
      socket.to(`#${user.roomID}`).emit('Re_StatusUpdate', {
        type: 'reconnect', username: user.username
      });
    } else {
      await current.accounts.flagUserOutRoom(data.username);
    }
    socket.emit('Re_RestoreRoom', result);
  }
  async joinRoom(socket, data) {
    var user = await current.accounts.getByUsername(data.username);
    var result = await current.rooms.joinRoom(user, data.roomID);
    if (result.success) {
      console.log(`[Rooms] ${data.username} has joined #${data.roomID}`);
      await current.accounts.flagUserInRoom(data.username, result.room.ID);
      current.activeClients[socket.id] = socket;
      socket.join(`#${data.roomID}`);
    }
    user = await current.accounts.getByUsername(data.username); // NOTE
      // this probably increases load on the DB
    result.user = current.accounts.cleanUserData(user);
    socket.emit('Re_JoinRoom', result);
    socket.to(`#${user.roomID}`).emit('Re_StatusUpdate', {
      type: 'join', username: data.username
    });
  }
  async leaveRoom(socket, data) {
    console.log(`[Rooms] ${data.username} has left #${data.roomID}`);
    await current.accounts.flagUserOutRoom(data.username);
    await current.rooms.leaveRoom(data.username, data.roomID);
    socket.leave(`#${data.roomID}`);
    delete current.activeClients[socket.id];
    socket.emit('Re_LeaveRoom', {});
    socket.to(`#${data.roomID}`).emit('Re_StatusUpdate', {
      type: 'leave', username: data.username
    });
  }
  async chatMessage(socket, data) {
    var user = await current.accounts.getByUsername(data.username);
    if (user.sessionID != data.sessionID) return;
    if (user.roomID != data.roomID) return;
    delete data.sessionID;
    socket.to(`#${data.roomID}`).emit('Re_ChatMessage', data);
    socket.emit('Re_ChatMessage', data);
  }
}
