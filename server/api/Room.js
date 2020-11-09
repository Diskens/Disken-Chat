const mongoose = require('mongoose');
const Validator = require('../src/Validator');
const Sanitizer = require('../src/Sanitizer');

let authenticate = async (data) => {
  let {userID, sessionID} = data;
  let users = await mongoose.model('Users').find({_id:userID});
  let {success, reason} = Validator.actionAuth({users, user:users[0], input:data});
  return {auth:success, reason, user:users[0]};
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
    let {auth, reason, user} = await authenticate(data);
    if (!auth) {
      socket.emit('GetUserRooms', {success:auth, reason});
      return;
    }
    let {userTriggered} = data;
    let rooms = await mongoose.model('Rooms').find({members:user._id});
    rooms = rooms.map((room)=>{return Sanitizer.sanitizeRoom(room)});
    for (let room of rooms) {
      socket.join(room.ID);
    }
    socket.emit('GetUserRooms', {success:true, rooms, userTriggered});
  },

  GetRoomUsernames: async (socket, data) => {
    let {auth, reason, user} = await authenticate(data);
    if (!auth) {
      socket.emit('GetRoomUsernames', {success:auth, reason});
      return;
    }
    let {roomID} = data;
    let model = mongoose.model('Rooms');
    let rooms = await model.find({_id:roomID});
    let validation = Validator.composite({rooms}, ['roomExists']);
    if (!validation.success) {
      socket.emit('GetRoomUsernames', {success:false, reason:validation.reason});
      return;
    }
    let memberIDs = rooms[0].members.map((elm)=>{
      return mongoose.Types.ObjectId(elm)});
    let members = await mongoose.model('Users').find({_id: { $in: memberIDs}});
    let usernames = {};
    for (let member of members) usernames[member._id] = member.username;
    socket.emit('GetRoomUsernames', {success:true, roomID, usernames});
  },

  CreateRoom: async (socket, data) => {
    let {auth, reason, user} = await authenticate(data);
    if (!auth) {
      socket.emit('CreateRoom', {success:false, reason});
      return;
    }
    let {name, makeVisible, requirePasscode} = data;
    let rooms = await mongoose.model('Rooms').find({name});
    let validation = Validator.composite({rooms, name},
      ['!roomExists', 'validRoomName']);
    if (!validation.success) {
      socket.emit('CreateRoom', {success:false, reason:validation.reason});
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

  JoinRoom: async (socket, data) => {
    let {auth, reason, user} = await authenticate(data);
    if (!auth) {
      socket.emit('JoinRoom', {success:false, reason});
      return;
    }
    let {userID, name, passcode} = data;
    let rooms = await mongoose.model('Rooms').find({name});
    let validation = Validator.composite({rooms, room:rooms[0], passcode},
      ['roomExists', 'passcode']);
    if (!validation.success) {
      socket.emit('JoinRoom', {success:false, reason:validation.reason});
      return;
    }
    let roomID = rooms[0]._id;
    await mongoose.model('Rooms').findOneAndUpdate({name},
      {$push: {members: userID}});
    socket.emit('JoinRoom', {success:true, name});
    global.log.entry('Socket', `${user.username} joined room ${name}`);
    global.app.io.sockets.in(roomID).emit('NewMember',
      {roomID, userID, username:user.username});
  },

  GetChatEntries: async (socket, data) => {
    let {auth, reason, user} = await authenticate(data);
    if (!auth) {
      socket.emit('GetChatEntries', {success:false, reason});
      return;
    }
    let {roomID} = data;
    let rooms = await mongoose.model('Rooms').find({_id:roomID});
    let validation = Validator.roomExists({rooms});
    if (!validation.success) {
      socket.emit('GetChatEntries', {success:false, reason:validation.reason});
      return;
    }
    let entries = rooms[0].entries;
    socket.emit('GetChatEntries', {success:true, roomID, entries});
  },

  NewEntry: async (socket, data) => {
    let {auth, reason, user} = await authenticate(data);
    if (!auth) {
      socket.emit('NewEntry', {error:true, reason});
      return;
    }
    let {roomID, userID, etype, content} = data;
    let rooms = await mongoose.model('Rooms').find({_id:roomID});
    let validation = Validator.roomExists({rooms});
    if (!validation.success) {
      socket.emit('NewEntry', {error:true, reason:validation.reason});
      return;
    }
    let entry = {
      etype, content,
      timestamp: Date.now(),
      userID, reactions: []
    };
    await mongoose.model('Rooms').findOneAndUpdate({_id:roomID},
      {$push: {entries: entry}});
    global.app.io.sockets.in(roomID).emit('NewEntry', {roomID, entry});
  },

  Reaction: async (socket, data) => {
    // Person.update({'items.id': 2}, {'$set': {
    //   'items.$.name': 'updated item2',
    //   'items.$.value': 'two updated'
    // }}
  }
};
module.exports = RoomApi;
