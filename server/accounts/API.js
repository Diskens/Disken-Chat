var meta, common, current;

exports.AccountsApi = class AccountsApi {
  constructor(data) {
    meta = data.meta; common = data.common; current = data.current;
    this.map = {
      Login: this.login,
      Signup: this.signup,
      Logout: this.logout,
      disconnect: this.disconnect,
      CookieLogin: this.cookieLogin
    };
  }

  async login(socket, data) {
    var result = await current.accounts.login(socket.id, data.username, data.password);
    if (result.success) console.log(`[Accounts] Player ${data.username} logged in`);
    socket.emit('Re_Login', result);
  }
  async signup(socket, data) {
    var result = await current.accounts.signup(data.username, data.password);
    if (result.success) console.log(`[Accounts] Player ${data.username} signed up`);
    socket.emit('Re_Signup', result);
  }
  async logout(socket, data) {
    var player = await current.accounts.getByUsername(data.username);
    if (player.inGame) {
      socket.to(`#${player.gameID}`).emit('Re_ChatAnnouncement', { type:'leave',
        text:`${player.username} has left the lobby`});
      socket.leave(`#${player.gameID}`);
      delete current.activeClients[socket.id];
      await current.games.leaveGame(data.username, player.gameID);
      await current.accounts.flagPlayerOutgame();
    }
    await current.accounts.logoutByUsername(data.username);
  }
  async disconnect(socket) {
    var player = await current.accounts.logoutBySocket(socket.id);
    if (player == undefined) return;
    if (!player.inGame) return;
    delete current.activeClients[socket.id];
    socket.to(`#${player.gameID}`).emit('Re_ChatAnnouncement', {
      type: 'disconnect',
      text: `${player.username} has disconnected (can reconnect in 5 s)`
    });
    setTimeout(async function(username) {
      var player = await current.accounts.getByUsername(username);
      if (player.isOnline || !player.inGame) return;
      console.log(`[Games] Kicking ${player.username} from #${player.gameID}`);
      await current.games.leaveGame(player.username, player.gameID);
      await current.accounts.flagPlayerOutgame(player.username);
      socket.to(`#${player.gameID}`).emit('Re_ChatAnnouncement', {
        type: 'kickout',
        text: `${player.username} was removed from the lobby`
      });
    }, 5000, player.username);
  }
  async cookieLogin(socket, data) {
    var result = await current.accounts.loginWithCookie(data.username, data.sessionID, socket.id);
    socket.emit('Re_CookieLogin', result);
    if (result.success)
      console.log(`[Accounts] Player ${result.player.username} reconnected`);
  }

}
