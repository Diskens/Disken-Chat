const DataHolder = require('../utils/DataHolder.js').DataHolder;
const Color = require('../utils/Color.js').Color;

exports.AccountsHolder = class AccountsHolder extends DataHolder {
  constructor() {
    super('current/accounts.json');
  }
  async login(sessionID, username, password) {
    var user = await this.db.asyncFindOne({username});
    if (user == undefined)
      return {success:false, reason:'No account with this username was found'};
    if (user.isOnline) {
      return {success:false, reason:'You are already logged in elsewhere'};
    }
    if (user.password != password)
      return {success:false, reason:'Incorrect password'};
    var data = {sessionID, isOnline: true, inRoom: false, roomID: null};
    user = this.cleanUserData(Object.assign(user, data));
    await this.db.updateEntry({username}, data);
    return {success: true, user};
  }
  async loginWithCookie(username, sessionID, newSessionID) {
    var user = await this.db.asyncFindOne({username});
    if (user == undefined) return {success:false};
    if (user.isOnline) return {success:false};
    if (user.sessionID == null) return {success:false};
    if (user.sessionID != sessionID) return {success:false};
    var data = {isOnline: true, sessionID:newSessionID};
    user = this.cleanUserData(Object.assign(user, data));
    await this.db.updateEntry({username}, data);
    return {success: true, user};
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
    var user = await this.db.asyncFindOne({username});
    if (user != undefined)
      return {success:false, reason:'Username already taken'};
    // Insert
    this.db.insert({ username, password,
      accountCreated: Date.now(), color: '#631F50',
      inRoom:false, roomID:null,
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
    var user = await this.db.asyncFindOne({sessionID});
    return user;
  }

  // ACCOUNT COLORS
  async changeColor(username, sessionID, colorCode) {
    var user = await this.db.asyncFindOne({username});
    if (sessionID != user.sessionID) return {success: false};
    var color = new Color(colorCode);
    color.makeValidBackground();
    await this.db.updateEntry({username}, {color:color.get()});
    return {success:true, roomID:user.roomID, color:color.get()};
  }
  async getColor(username) {
    var user = await this.db.asyncFindOne({username});
    return {username, color:user.color};
  }

  // IN-ROOM FLAG
  async flagUserInRoom(username, roomID) {
    await this.db.updateEntry({username}, {inRoom:true, roomID});
  }
  async flagUserOutRoom(username) {
    await this.db.updateEntry({username}, {inRoom:false, roomID:null});
  }

  // UTILITIES
  async getByUsername(username) {
    var user = await this.db.asyncFindOne({username});
    return user;
  }
  cleanUserData(user) {
    delete user.password;
    delete user.sessionID;
    delete user._id;
    return user;
  }
  async flagEveryoneOffline() {
    console.log('[Accounts] Flagging everyone offline');
    var users = await this.db.asyncFind({});
    for (var user of users) {
      await this.db.updateEntry({username:user.username}, {isOnline:false})
    }
  }
}
