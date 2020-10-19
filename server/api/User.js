const mongoose = require('mongoose');

let sanitizeUser = (user) => {
  user.password = undefined;
  user.sessionID = undefined;
  user.__v = undefined;
  user._id = undefined;
  return user;
}

let UserApi = {
  reset: async () => {
    await mongoose.model('Users').updateMany({}, {isOnline:false});
  },

  connection: async (socket) => {
    global.log.entry('Socket', 'Client connected');
    socket.emit('Initialize', {
      version:global.config.version, release:global.config.release});
  },

  disconnect: async (socket) => {
    let user = await mongoose.model('Users').findOneAndUpdate(
      {sessionID:socket.id}, {isOnline:false});
    if (user !== null)
      global.log.entry('Socket', `${user.username} disconnected`);
  },

  CredsLogin: async (socket, data) => {
    cookies = false;
    let {username, password, sessionID} = data;
    let users = await mongoose.model('Users').find({username});
    if (!users.length) {
      socket.emit('Login', {cookies, success:false, reason:'User not found'});
      return; }
    if (users[0].password != password) {
      socket.emit('Login', {cookies, success:false, reason:'Incorrect password'});
      return; }
    if (users[0].isOnline) {
      socket.emit('Login', {cookies, success:false, reason:'Already logged in'});
      return; }
    await mongoose.model('Users').findOneAndUpdate({username},
      {isOnline:true, sessionID});
    socket.emit('Login', {cookies, success:true, user:sanitizeUser(users[0])});
    global.log.entry('Socket', `${username} logged in`);
  },

  CookieLogin: async (socket, data) => {
    cookies = true;
    let {username, sessionID, newSession} = data;
    let users = await mongoose.model('Users').find({username});
    if (!users.length) {
      socket.emit('Login', {cookies, success:false, reason:'User not found'});
      return; }
    if (users[0].sessionID != sessionID) {
      socket.emit('Login', {cookies, success:false, reason:'Invalid SessionID'});
      return; }
    if (users[0].isOnline) {
      socket.emit('Login', {cookies, success:false, reason:'Already logged in'});
      return; }
    await mongoose.model('Users').findOneAndUpdate({username},
      {isOnline:true, sessionID:newSession});
    socket.emit('Login', {cookies, success:true, user:sanitizeUser(users[0])});
    global.log.entry('Socket', `${username} logged in (cookies)`);
  },

  Logout: async (socket, data) => {
    let {username, sessionID} = data;
    let users = await mongoose.model('Users').find({username});
    if (!users.length) {
      socket.emit('Logout', {success:false, reason:'User not found'});
      return; }
    if (users[0].sessionID != sessionID) {
      socket.emit('Logout', {success:false, reason:'Invalid SessionID'});
      return; }
    await mongoose.model('Users').findOneAndUpdate({username},
      {isOnline:false, sessionID:undefined});
    socket.emit('Logout', {success:true});
    global.log.entry('Socket', `${username} logged out`);
  },

  Signup: async (socket, data) => {
    let uc = global.config.user;
    let {username, email, password, sessionID} = data;
    let success = true, reason='';
    if (username.length < uc.usernameMin || username.length > uc.usernameMax) {
      reason = `Username must be at least ${uc.usernameMin} but no more ` +
      `than ${uc.usernameMax} characters`;
      success = false;
    }
    if (password.length < uc.passwordMin || password.length > uc.passwordMax) {
      reason = `Password must be at least ${uc.passwordMin} but no more ` +
      `than ${uc.passwordMax} characters`;
      success = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      reason = `Please provide a valid email address`;
      success = false;
    }
    if ((await mongoose.model('Users').find({username})).length) {
      reason = `Username already in use`;
      success = false;
    }
    if (!success) { socket.emit('Signup', {success, reason}); return; }
    mongoose.model('Users').create({
      username, email, password, sessionID,
      joined: Date.now() + global.config.tzOffset
    });
    socket.emit('Signup', {success});
    global.log.entry('Socket', `${username} signed up`);
  },
};
module.exports = UserApi;
