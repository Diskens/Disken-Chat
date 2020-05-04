const DataHolder = require('./utilities/DataHolder.js').DataHolder;
const stru = require('./utilities/StringUtils.js');

exports.RoomsData = class RoomsData extends DataHolder {
  constructor() {
    super('data/Rooms.json');
  }
  async reset() {
    var rooms = await this.db.asyncFind({});
    for (var room of rooms) {
      var status = {};
      for (var username of Object.keys(room.status)) status[username] = 0;
      await this.db.updateEntry({ID:room.ID}, {activeCount:0, status});
    }
  }
  async getRoom(roomID) {
    var room = await this.db.asyncFindOne({ID:roomID});
    return room;
  }
  async getUserRooms(username) {
    var rooms = await this.db.asyncFind({users:{$elemMatch:username}});
    return {rooms};
  }
  cleanRoomData(room) {
    delete room._id;
    return room;
  }
  generatePasscode() {
    var length = 24;
    var code = '';
    var hex = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
    for (var x = 0; x < length; x+=1) code += hex[Math.floor(Math.random() * 16)];
    return code;
  }

  async createRoom(data) {
    var {owner, name, isPublic, history} = data;
    if (!stru.isOfLength(name, 3, 24))
      return {success:false, reason:'Name must be of length 3-24 characters'};
    if (!stru.isLegalName(name))
      return {success:false, reason:'Name contains invalid characters'};
    var room = {
      ID:global.$DATA.meta.getNextRoomID(), name, owner,
      isPublic, history, users:[owner], status:{}, activeCount:0,
      passcode: this.generatePasscode()
    };
    room.status[owner] = 1;
    await this.db.insert(room);
    return {success:true, room:this.cleanRoomData(room)};
  }
  async joinRoom(roomName, username, passcode) {
    var room = await this.db.asyncFindOne({name:roomName});
    if (room == undefined)
      return {success:false, reason:'Room with this name does not exist'};
    if (room.passcode != passcode && !room.isPublic)
      return {success:false, reason:'Incorrect passcode'};
    await this.db.update({ID:room.ID}, {$push: {users:username}});
    return {success:true, room:this.cleanRoomData(room)};
  }
  async setUserStatus(roomID, username, status) {
    var room = await this.db.asyncFindOne({ID:roomID})
    var current = room.status[username];
    var delta = 0;
    if (current == status) return {delta, previous:current, room};
    var update = {status:{}};
    update['status'][username] = status;
    await this.db.updateEntry({ID:roomID}, update);
    if (current == 2 && status != 2) {
      await this.decrActiveCount(room); room.activeCount -= 1; delta = -1; }
    if (current != 2 && status == 2) {
      await this.incrActiveCount(room); room.activeCount += 1; delta = 1; }
    return {delta, previous:current, room:this.cleanRoomData(room)}; // do not change room status
  }
  async incrActiveCount(room) {
    // global.$LOG.entry('Rooms', `Active in #${room.ID}: ${room.activeCount+1}`);
    await this.db.updateEntry({ID:room.ID}, {activeCount:room.activeCount+1});
  }
  async decrActiveCount(room) {
    // global.$LOG.entry('Rooms', `Active in #${room.ID}: ${room.activeCount-1}`);
    await this.db.updateEntry({ID:room.ID}, {activeCount:room.activeCount-1});
  }
  async resetPasscode(roomID) {
    var passcode = this.generatePasscode();
    await this.db.updateEntry({ID:roomID}, {passcode});
    return {passcode};
  }
}
