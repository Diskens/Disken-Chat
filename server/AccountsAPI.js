
exports.AccountsApi = class AccountsApi {
  constructor() {
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
    var result = await global.$DATA.accounts.credsLogin(socket, socket.id, data);
    socket.emit('CredsLogin', result);
    if (result.success) {
      global.$LOG.entry('Accounts', `${result.user.username} logged in`);
      await global.$APIS.status.setStatusAllRooms(result.user.username, 1);
    }
  }
  async cookieLogin(socket, data) {
    var result = await global.$DATA.accounts.cookieLogin(socket, socket.id, data);
    socket.emit('CookieLogin', result);
    if (result.success) {
      global.$LOG.entry('Accounts', `${result.user.username} reconnected`);
      await global.$APIS.status.setStatusAllRooms(result.user.username, 1);
    }
  }
  async connection(socket) {
    var version = global.$DATA.meta.getVersion();
    var release = global.$DATA.meta.getRelease();
    socket.emit('Connect', {version, release});
    global.$DATA.meta.incrOnlineCount();
  }
  async disconnect(socket) {
    global.$DATA.meta.decrOnlineCount();
    var result = await global.$DATA.accounts.flagOffline(socket.id);
    if (!result.success) return
    global.$LOG.entry('Accounts', `${result.username} disconnected`);
    await global.$APIS.status.setStatusAllRooms(result.username, 0);
  }
  async logout(socket, data) {
    var result = await global.$DATA.accounts.logout(socket.id, data);
    if (result.success)
      global.$LOG.entry('Accounts', `${data.username} logged out`);
    socket.emit('Logout', result);
    await global.$APIS.status.setStatusAllRooms(result.username, 0);
  }
  async signup(socket, data) {
    var result = await global.$DATA.accounts.signup(data);
    if (result.success)
      global.$LOG.entry('Accounts', `${data.username} signed up`);
    socket.emit('Signup', result);
  }
}
