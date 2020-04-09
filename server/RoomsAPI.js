var $LOG, $DATA;

exports.RoomsApi = class RoomsApi {
  constructor(_log, _data) {
    $LOG = _log; $DATA = _data;
    this.callbacks = {
      CreateRoom: this.createRoom,
      JoinRoom: this.joinRoom,
      GetUserRooms: this.getUserRooms,
      Message: this.message,
      RoomUserStatus: this.roomUserStatus,
      GetChatHistory: this.getChatHistory,
      ResetPasscode: this.resetPasscode
    };
  }

  async createRoom(socket, data) {
    var result = await $DATA.rooms.createRoom(data);
    if (!result.success) return;
    if (result.room.history)
      await $DATA.history.createRoom(result.room.ID);
    $LOG.entry('Rooms', `${data.owner} created room "${data.name}"`);
    socket.emit('CreateRoom', result);
  }
  async joinRoom(socket, data) {
    var result = await $DATA.rooms.joinRoom(data.roomName, data.username, data.passcode);
    socket.emit('JoinRoom', result);
    if (result.success) {
      delete result.success;
      for (var username of result.room.users) {
        var comember = await $DATA.accounts.sockets[username];
        if (comember == undefined || username != data.username) continue;
        comember.emit('NewRoomMember', result);
      }
    }
  }
  async getUserRooms(socket, data) {
    var result = await $DATA.rooms.getUserRooms(data.username);
    socket.emit('GetUserRooms', result);
  }
  async message(socket, data) {
    $LOG.entry('Rooms', `New message in ${data.roomID}`);
    data.timestamp = Date.now();
    var room = await $DATA.rooms.getRoom(data.roomID);
    if (room.history)
      await $DATA.history.addMessage(data);
    for (var username of room.users) {
      var comember = await $DATA.accounts.sockets[username];
      if (comember == undefined) continue;
      comember.emit('Message', data);
    }
  }
  async roomUserStatus(socket, data) {
    var user = await $DATA.accounts.getUser(data.username);
    if (socket.id != user.sessionID)
      return {success:false, reason:'Invalid session'};
    var status = {'offline':0, 'away':1, 'active':2}[data.status];
    var result = await $DATA.rooms.setUserStatus(data.roomID, data.username, status);
    if (!result.delta) return;
    if (result.room.activeCount == 1 && result.delta > 0)
      $DATA.history.activateRoom(data.roomID);
    if (!result.room.activeCount)
      $DATA.history.deactivateRoom(data.roomID);
    for (var username of result.room.users) {
      var comember = $DATA.accounts.sockets[username];
      if (comember != undefined) comember.emit('RoomUserStatus', data);
    }
  }
  async getChatHistory(socket, data) {
    $LOG.entry('Rooms', `Sending history of #${data.roomID} to ${data.username}`);
    var result = await $DATA.history.getChatHistory(data.roomID);
    socket.emit('ChatHistory', result);
  }
  async resetPasscode(socket, data) {
    $LOG.entry('Rooms', `Resettings passcode of #${data.roomID}`);
    var result = await $DATA.rooms.resetPasscode(data.roomID);
    result.silent = false;
    socket.emit('ResetPasscode', result);
    if (result.success) {
      result.silent = true;
      for (var username of room.users) {
        var comember = $DATA.accounts[username];
        if (comember != undefined) comember.emit('ResetPasscode', result);
      }
    }
  }
}
