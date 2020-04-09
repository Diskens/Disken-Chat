const DataHolder = require('./utilities/DataHolder.js').DataHolder;
var $LOG, $META;

exports.AccountsData = class AccountsData extends DataHolder {
  constructor(_log, _meta) {
    $LOG = _log; $META = _meta;
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
    await this.db.updateEntry({username:data.username}, {isOnline:false, sessionID:null});
    return {success:true};
  }
  async signup(data) {
    // Length and characters check
    if (data.username.length < 3 || data.username.length > 16)
      return {success:false, reason:'Username length must be between 3 and 16'};
    if (data.password.length < 6)
      return {success:false, reason:'Password must be at least 6 characters long'};
    for (var char of '<>{}[](),./?;\':"-=_+\\!@$%^&*`~|') {
      if (data.username.includes(char))
        return {success:false, reason:'Username contains invalid character'};
    }
    // Username taken check
    var existingUser = await this.getUser(data.username);
    if (existingUser != undefined)
      return {success:false, reason:'Username already taken'};
    // Insert
    await this.db.insert({ username:data.username, password:data.password,
      accountCreated: Date.now(), color: '#631F50',
      isOnline:false, sessionID:null,
      unreadRooms: []
    });
    return {success:true};
  }
}
