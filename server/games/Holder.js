const DataHolder = require('../utils/DataHolder.js').DataHolder;

exports.GamesHolder = class GamesHolder extends DataHolder {
  constructor() {
    super('current/games.json');
  }
  async getAvailableGames() {
    var games = await this.db.asyncFind({phase:'lobby'});
    return games;
  }
  async createGame(maxPlayers, mapID) {
    if (!maxPlayers)
      return {success:false, reason:'Max players can not be zero'};
    if (maxPlayers > 10)
      return {success:false, reason:'Max players can not be more than 10'};
    this.db.insert({
      ID: meta.getNextGameID(),
      startTime: Date.now(),
      maxPlayers, mapID,
      phase: 'lobby',
      players: [],
    });
    return {success:true};
  }
  async joinLobby(player, gameID) {
    var game = await this.db.asyncFindOne({ID:gameID});
    if (game == undefined)
      return {success:false, reason:'Game no longer exists'};
    if (game.phase != 'lobby')
      return {success:false, reason:'Game has already started'};
    if (game.players.length == game.maxPlayers)
      return {success:false, reason:'Game is already full'};
    if (player.inGame)
      return {success:false, reason:'You already have joined a game'};
    game.players.push(player.username);
    await this.db.updateEntry({ID:gameID}, game);
    return {success:true, game};
  }
  async leaveGame(username, gameID) {
    var game = await this.db.asyncFindOne({ID:gameID});
    game.players.splice(game.players.indexOf(username), 1);
    await this.db.updateEntry({ID:gameID}, game);
  }

  async getByID(ID) {
    var game = await this.db.asyncFindOne({ID});
    return game;
  }
}
