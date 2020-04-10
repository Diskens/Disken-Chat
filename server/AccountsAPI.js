var $LOG, $DATA;

exports.AccountsApi = class AccountsApi {
  // Creating and accessing the account
  constructor(_log, _data) {
    $LOG = _log; $DATA = _data;
    this.callbacks = {
      CredsLogin: this.credsLogin,
      CookieLogin: this.cookieLogin,
      connection: this.connection,
      disconnect: this.disconnect,
      Logout: this.logout,
      Signup: this.signup
    };
  }

  async credsLogin(socket, data) {
    var result = await $DATA.accounts.credsLogin(socket, socket.id, data);
    socket.emit('CredsLogin', result);
    if (result.success)
      $LOG.entry('Accounts', `${result.user.username} logged in`);
  }
  async cookieLogin(socket, data) {
    var result = await $DATA.accounts.cookieLogin(socket, socket.id, data);
    socket.emit('CookieLogin', result);
    if (result.success)
      $LOG.entry('Accounts', `${result.user.username} reconnected`);
  }
  async connection(socket) {
    var version = $DATA.meta.getVersion();
    var release = $DATA.meta.getRelease();
    socket.emit('Connect', {version, release});
    $DATA.meta.incrOnlineCount();
  }
  async disconnect(socket) {
    $DATA.meta.decrOnlineCount();
    var result = await $DATA.accounts.flagOffline(socket.id);
    if (!result.success) return
    $LOG.entry('Accounts', `${result.username} disconnected`);
    var userRooms = (await $DATA.rooms.getUserRooms(result.username)).rooms;
    for (var room of userRooms) { // TODO
      var statusResult = $DATA.rooms.setUserStatus(room.ID, result.username, 0);
      if (!statusResult.delta) return;
      if (statusResult.room.activeCount == 1 && statusResult.delta > 0)
      $DATA.history.activateRoom(data.roomID);
      if (!statusResult.room.activeCount)
      $DATA.history.deactivateRoom(data.roomID);
      for (var username of statusResult.room.users) {
        var comember = $DATA.accounts.sockets[username];
        if (comember != undefined) comember.emit('RoomUserStatus', data);
      }
    }
  }
  async logout(socket, data) {
    var result = await $DATA.accounts.logout(socket.id, data);
    if (result.success)
      $LOG.entry('Accounts', `${data.username} logged out`);
    var userRooms = (await $DATA.rooms.getUserRooms(result.username)).rooms;
    for (var room of userRooms) { // TODO
      var statusResult = $DATA.rooms.setUserStatus(room.ID, result.username, 0);
      if (!statusResult.delta) return;
      if (statusResult.room.activeCount == 1 && statusResult.delta > 0)
      $DATA.history.activateRoom(data.roomID);
      if (!statusResult.room.activeCount)
      $DATA.history.deactivateRoom(data.roomID);
      for (var username of statusResult.room.users) {
        var comember = $DATA.accounts.sockets[username];
        if (comember != undefined) comember.emit('RoomUserStatus', data);
      }
    }
    socket.emit('Logout', result);
  }
  async signup(socket, data) {
    var result = await $DATA.accounts.signup(data);
    if (result.success)
      $LOG.entry('Accounts', `${data.username} signed up`);
    socket.emit('Signup', result);
  }
}
