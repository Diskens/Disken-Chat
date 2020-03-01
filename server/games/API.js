var meta, common, current;

exports.GamesApi = class GamesApi {
  constructor(data) {
    meta = data.meta; common = data.common; current = data.current;
    this.map = {
      GetAvailableGames: this.getAvailableGames,
      CreateGame: this.createGame,
      RestoreGame: this.restoreGame,
      JoinLobby: this.joinLobby,
      LeaveLobby: this.leaveLobby,
      ChatMessage: this.chatMessage
    }
  }

  async getAvailableGames(socket, data) {
    console.log('[Games] Sending list of available games');
    var result = await current.games.getAvailableGames();
    socket.emit('Re_GetAvailableGames', {games:result});
  }
  async createGame(socket, data) {
    console.log(`[Games] Creating a new game on map ${data.mapID}`);
    var result = await current.games.createGame(data.maxPlayers, data.mapID);
    socket.emit('Re_CreateGame', result);
  }
  async restoreGame(socket, data) {
    var player = await current.accounts.getByUsername(data.username);
    var game = await current.games.getByID(player.gameID);
    var result = {success:true};
    if (player.sessionID != data.sessionID)
      result = {success:false, reason:'Your session ID does not match'};
    if (game == undefined)
      result = {success:false, reason:'Game no longer exists'};
    if (game.phase != 'lobby')
      result = {success:false, reason:'Can not restore game after it started'};
    if (!game.players.includes(player.username))
      result = {success:false, reason:'You are no longer in this game'};
    if (result.success) {
      result.game = game;
      console.log(`[Games] ${data.username} is back in #${game.ID}`);
      current.activeClients[socket.id] = socket;
      socket.join(`#${game.ID}`);
      socket.to(`#${game.ID}`).emit('Re_ChatAnnouncement', { type:'reconnect',
        text:`${player.username} has reconnected`});
    } else {
      await current.accounts.flagPlayerOutgame(data.username);
    }
    socket.emit('Re_RestoreGame', result);
  }
  async joinLobby(socket, data) {
    var player = await current.accounts.getByUsername(data.username);
    var result = await current.games.joinLobby(player, data.gameID);
    if (result.success) {
      console.log(`[Games] ${data.username} has joined #${data.gameID}`);
      await current.accounts.flagPlayerIngame(data.username, result.game.ID);
      current.activeClients[socket.id] = socket;
      socket.join(`#${data.gameID}`);
    }
    player = await current.accounts.getByUsername(data.username); // NOTE
      // this probably increases load on the DB
    result.player = current.accounts.cleanPlayerData(player);
    socket.emit('Re_JoinLobby', result);
    socket.to(`#${result.game.ID}`).emit('Re_ChatAnnouncement', { type:'join',
      text:`${result.player.username} has joined the lobby`});
  }
  async leaveLobby(socket, data) {
    console.log(`[Games] ${data.username} has left #${data.gameID}`);
    await current.accounts.flagPlayerOutgame(data.username);
    await current.games.leaveGame(data.username, data.gameID);
    socket.leave(`#${data.gameID}`);
    delete current.activeClients[socket.id];
    socket.emit('Re_LeaveLobby', {});
    socket.to(`#${data.gameID}`).emit('Re_ChatAnnouncement', { type:'leave',
      text:`${data.username} has left the lobby`});
  }
  async chatMessage(socket, data) {
    console.log(`[Games] There are ${Object.keys(current.activeClients).length} active players`);
    console.log(`[Games] ${data.username}@${data.gameID}: ${data.text}`);
    var player = await current.accounts.getByUsername(data.username);
    if (player.sessionID != data.sessionID) return;
    if (player.gameID != data.gameID) return;
    delete data.sessionID;
    socket.to(`#${data.gameID}`).emit('Re_ChatMessage', data);
    socket.emit('Re_ChatMessage', data);
  }
}
