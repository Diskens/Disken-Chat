const mongoose = require('mongoose');

let authenticate = async (data) => {
  let {username, sessionID} = data;
  let users = await mongoose.model('Users').find({username});
  if (!users.length) return {auth:false};
  if (users[0].sessionID != sessionID) return {auth:false};
  return {auth:true, user:users[0]};
}

let getRandomPasscode = () => {
  let length = 24;
  let code = '';
  let digits = '0123456789ABCDEF';
  for (let i = 0; i < length; i+=1)
    code += digits.substr(Math.floor(Math.random()*16), 1);
  return code;
}

let RoomApi = {
  reset: async () => {},

  GetUserRooms: async (socket, data) => {
    let {auth, user} = await authenticate(data);
    if (!auth) {
      socket.emit('GetUserRooms', {success:false, reason:'Authentication error'});
      return;
    }
    let rooms = await mongoose.model('Rooms').find({members:user._id});
    socket.emit('GetUserRooms', {success:true, rooms});
  },

  CreateRoom: async (socket, data) => {
    let {auth, user} = await authenticate(data);
    let {name, makeVisible, requirePasscode} = data;
    if (!auth) {
      socket.emit('CreateRoom', {success:false, reason:'Authentication error'});
      return;
    }
    if ((await mongoose.model('Rooms').find({name})).length) {
      socket.emit('CreateRoom', {success:false,
        reason:'This room name is already taken'});
      return;
    }
    mongoose.model('Rooms').create({
      name, passcode:getRandomPasscode(), created:Date.now(),
      owner: user._id, members: [user._id],
      makeVisible, requirePasscode
    });
    socket.emit('CreateRoom', {success:true, name});
    global.log.entry('Socket', `${user.username} created room ${name}`);
  },
};
module.exports = RoomApi;
