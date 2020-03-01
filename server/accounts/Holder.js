const DataHolder = require('../utils/DataHolder.js').DataHolder;

exports.AccountsHolder = class AccountsHolder extends DataHolder {
  constructor() {
    super('current/accounts.json');
  }
  async login(sessionID, username, password) {
    var player = await this.db.asyncFindOne({username});
    if (player == undefined)
      return {success:false, reason:'No account with this username was found'};
    if (player.isOnline) {
      return {success:false, reason:'You are already logged in elsewhere'};
    }
    if (player.password != password)
      return {success:false, reason:'Incorrect password'};
    var data = {sessionID, isOnline: true, inGame: false, gameID: null};
    player = this.cleanPlayerData(Object.assign(player, data));
    await this.db.updateEntry({username}, data);
    return {success: true, player};
  }
  async loginWithCookie(username, sessionID, newSessionID) {
    var player = await this.db.asyncFindOne({username});
    if (player == undefined) return {success:false};
    if (player.isOnline) return {success:false};
    if (player.sessionID == null) return {success:false};
    if (player.sessionID != sessionID) return {success:false};
    var data = {isOnline: true, sessionID:newSessionID};
    player = this.cleanPlayerData(Object.assign(player, data));
    await this.db.updateEntry({username}, data);
    return {success: true, player};
  }
  async signup(username, password) {
    // Length and characters check
    if (username.length < 3 || username.length > 16)
      return {success:false, reason:'Username length must be between 3 and 16'};
    if (password.length < 6)
      return {success:false, reason:'Password must be at least 6 characters long'};
    for (var char of '<>{}[](),./?;\':"-=_+\\!@$%^&*`~|') {
      if (username.includes(char))
        return {success:false, reason:'Username contains invalid character'};
    }
    // Username taken check
    var player = await this.db.asyncFindOne({username});
    if (player != undefined)
      return {success:false, reason:'Username already taken'};
    // Insert
    this.db.insert({ username, password,
      gamesPlayed: 0, accountCreated: Date.now(),
      inGame:false, gameID:null, isReady:false,
      isOnline:false, sessionID:null,
      permissions: 0
    });
    return {success:true};
  }
  async logoutByUsername(username) {
    await this.db.updateEntry({username}, {isOnline:false, sessionID:null});
  }
  async logoutBySocket(sessionID) {
    try {await this.db.updateEntry({sessionID}, {isOnline:false});}
    catch (err) { if (err != 'QueryNotFoundError') throw err; }
    var player = await this.db.asyncFindOne({sessionID});
    return player;
  }

  async getByUsername(username) {
    var player = await this.db.asyncFindOne({username});
    return player;
  }
  async flagPlayerIngame(username, gameID) {
    await this.db.updateEntry({username}, {inGame:true, gameID});
  }
  async flagPlayerOutgame(username) {
    await this.db.updateEntry({username}, {inGame:false, gameID:null});
  }

  cleanPlayerData(player) {
    delete player.password;
    delete player.sessionID;
    delete player._id;
    return player;
  }
  async flagEveryoneOffline() {
    console.log('[Accounts] Flagging everyone offline');
    var players = await this.db.asyncFind({});
    for (var player of players) {
      await this.db.updateEntry({username:player.username}, {isOnline:false})
    }
  }
}
