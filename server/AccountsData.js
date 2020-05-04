const DataHolder = require('./utilities/DataHolder.js').DataHolder;

exports.AccountsData = class AccountsData extends DataHolder {
  constructor() {
    super('data/Accounts.json');
    this.sockets = {};
  }
  async reset() {
    var users = await this.db.asyncFind({});
    for (var user of users)
      await this.db.updateEntry({username:user.username}, {isOnline:false});
  }
  async flagOffline(sessionID) {
    var user = await this.db.asyncFindOne({sessionID});
    if (user == undefined) return {success:false};
    delete this.sockets[user.username];
    await this.db.updateEntry({username:user.username}, {isOnline:false});
    return {success:true, username:user.username};
  }
  async getUser(username) {
    var user = await this.db.asyncFindOne({username});
    return user;
  }
  cleanUserData(user) {
    delete user.password;
    delete user.sessionID;
    delete user._id;
    return user;
  }
  broadcast(usernames, key, data) {
    var successes = [];
    for (var username of usernames) {
      var socket = this.sockets[username];
      if (socket == undefined) continue;
      socket.emit(key, data);
      successes.push(username);
    }
    return successes;
  }

  async credsLogin(socket, sessionID, data) {
    var user = await this.getUser(data.username);
    if (user == undefined)
      return {success:false, reason:'No user with this name exists'};
    if (user.password != data.password)
      return {success:false, reason:'Incorrect password'};
    if (user.isOnline)
      return {success:false, reason:'You are already logged in elsewhere'};
    this.sockets[user.username] = socket;
    var update = {sessionID, isOnline:true};
    await this.db.updateEntry({username:user.username}, update);
    return {success:true, user:this.cleanUserData(Object.assign(user, update))};
  }
  async cookieLogin(socket, sessionID, data) {
    var user = await this.getUser(data.username);
    if (user == undefined)
      return {success:false, reason:'No user with this name exists'};
    if (user.sessionID != data.sessionID)
      return {success:false, reason:'Invalid session'};
    if (user.isOnline)
      return {success:false, reason:'You are already logged in elsewhere'};
    this.sockets[user.username] = socket;
    var update = {sessionID, isOnline:true};
    await this.db.updateEntry({username:user.username}, update);
    return {success:true, user:this.cleanUserData(Object.assign(user, update))};
  }
  async logout(sessionID, data) {
    var user = await this.getUser(data.username);
    if (user.sessionID != sessionID)
      return {success:false, reason:'Invalid session'};
    await this.db.updateEntry({username:user.username}, {isOnline:false, sessionID:null});
    return {success:true, username:user.username};
  }
  async signup(data) {
    // Length and characters check
    if (!stru.isOfLength(data.username, 3, 24))
      return {success:false, reason:'Username must be of length 3-24 characters'};
    if (!stru.isLegalName(data.username))
      return {success:false, reason:'Username contains invalid characters'};
    if (!stru.isOfLength(data.password, 6, 63))
      return {success:false, reason:'Password must be of length 6-63 characters'};
    // Username taken check
    var existingUser = await this.getUser(data.username);
    if (existingUser != undefined)
      return {success:false, reason:'Username already taken'};
    // Insert
    await this.db.insert({ username:data.username, password:data.password,
      accountCreated: Date.now(),
      isOnline:false, sessionID:null,
      unreadRooms: []
    });
    return {success:true};
  }
}
