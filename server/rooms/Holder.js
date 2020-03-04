const DataHolder = require('../utils/DataHolder.js').DataHolder;
var meta;

exports.RoomsHolder = class RoomsHolder extends DataHolder {
  constructor(_meta) {
    super('current/rooms.json');
    meta = _meta;
  }
  async getAvailableRooms() {
    var rooms = await this.db.asyncFind({});
    return rooms;
  }
  async createRoom(maxUsers, mapID) {
    if (!maxUsers)
      return {success:false, reason:'Max users can not be zero'};
    if (maxUsers > 10)
      return {success:false, reason:'Max users can not be more than 10'};
    this.db.insert({
      ID: meta.getNextRoomID(),
      startTime: Date.now(),
      maxUsers, mapID,
      users: [],
    });
    return {success:true};
  }
  async joinRoom(user, roomID) {
    var room = await this.db.asyncFindOne({ID:roomID});
    if (room == undefined)
      return {success:false, reason:'Room no longer exists'};
    if (room.users.length == room.maxUsers)
      return {success:false, reason:'Room is already full'};
    if (user.inRoom)
      return {success:false, reason:'You already have joined a room'};
    room.users.push(user.username);
    await this.db.updateEntry({ID:roomID}, room);
    return {success:true, room};
  }
  async leaveRoom(username, roomID) {
    var room = await this.db.asyncFindOne({ID:roomID});
    room.users.splice(room.users.indexOf(username), 1);
    await this.db.updateEntry({ID:roomID}, room);
  }

  async getByID(ID) {
    var room = await this.db.asyncFindOne({ID});
    return room;
  }
}
