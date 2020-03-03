var meta, common, current;

exports.AccountsApi = class AccountsApi {
  constructor(data) {
    meta = data.meta; common = data.common; current = data.current;
    this.map = {
      Login: this.login,
      Signup: this.signup,
      Logout: this.logout,
      disconnect: this.disconnect,
      CookieLogin: this.cookieLogin,
      SetIsTyping: this.setIsTyping,
      ChangeUserColor: this.changeUserColor,
      GetUserColor: this.getUserColor
    };
  }

  async login(socket, data) {
    var result = await current.accounts.login(socket.id, data.username, data.password);
    if (result.success) console.log(`[Accounts] ${data.username} logged in`);
    socket.emit('Re_Login', result);
  }
  async signup(socket, data) {
    var result = await current.accounts.signup(data.username, data.password);
    if (result.success) console.log(`[Accounts] ${data.username} signed up`);
    socket.emit('Re_Signup', result);
  }
  async logout(socket, data) {
    var user = await current.accounts.getByUsername(data.username);
    if (user.inRoom) {
      socket.to(`#${user.roomID}`).emit('Re_StatusUpdate', {
        type: 'leave', username: data.username
      });
      socket.leave(`#${user.roomID}`);
      delete current.activeClients[socket.id];
      await current.rooms.leaveRoom(data.username, user.roomID);
      await current.accounts.flagUserOutRoom();
    }
    await current.accounts.logoutByUsername(data.username);
  }
  async disconnect(socket) {
    var user = await current.accounts.logoutBySocket(socket.id);
    if (user == undefined) return;
    if (!user.inRoom) return;
    delete current.activeClients[socket.id];
    console.log(`[Rooms] Lost connection with ${user.username}`);
    socket.to(`#${user.roomID}`).emit('Re_StatusUpdate', {
      type: 'disconnect', username: user.username
    });
    setTimeout(async function(username) {
      var user = await current.accounts.getByUsername(username);
      if (user.isOnline || !user.inRoom) return;
      console.log(`[Rooms] Kicking ${user.username} from #${user.roomID}`);
      await current.rooms.leaveRoom(user.username, user.roomID);
      await current.accounts.flagUserOutRoom(user.username);
      socket.to(`#${user.roomID}`).emit('Re_StatusUpdate', {
        type: 'kickout', username: username
      });
    }, 5000, user.username);
  }
  async cookieLogin(socket, data) {
    var result = await current.accounts.loginWithCookie(data.username, data.sessionID, socket.id);
    socket.emit('Re_CookieLogin', result);
    if (result.success)
      console.log(`[Accounts] ${result.user.username} reconnected`);
  }
  async setIsTyping(socket, data) {
    var user = await current.accounts.getByUsername(data.username);
    if (user.sessionID != data.sessionID) return {success:false};
    if (!user.inRoom) return {success:false};
    socket.to(`#${user.roomID}`).emit('Re_SetIsTyping', {username:data.username, status:data.status});
  }
  async changeUserColor(socket, data) {
    var result = await current.accounts.changeColor(data.username, data.sessionID, data.color);
    console.log(`[Accounts] ${data.username} changed chat color`);
    if (result.success) {
      var roomID = result.roomID;
      delete result.roomID;
      if (roomID != null)
        socket.to(`#${roomID}`).emit('Re_GetUserColor', {username:data.username,color:result.color});
    }
    socket.emit('Re_ChangeUserColor', result);
  }
  async getUserColor(socket, data) {
    var result = await current.accounts.getColor(data.username);
    socket.emit('Re_GetUserColor', result);
  }
}
