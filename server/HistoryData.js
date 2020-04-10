const RHF = require('./utilities/RHF.js').RHF;

function makeFilename(roomID) { return `data/history/room_${roomID}.rhf`; }

exports.HistoryData = class HistoryData {
  constructor() {
    this.rooms = {};
  }
  async createRoom(roomID) {
    var filename = makeFilename(roomID);
    var rhf = RHF.create(makeFilename(roomID));
  }
  activation(room, delta) {
    if (!room.activeCount && delta > 0) global.$DATA.history.activateRoom(room.ID);
    if (room.activeCount == 1 && delta < 0) global.$DATA.history.deactivateRoom(room.ID);
  }
  activateRoom(roomID) {
    global.$LOG.entry('History', `Activating room ${roomID}`);
    global.$DATA.history.rooms[roomID] = new RHF(makeFilename(roomID));
  }
  deactivateRoom(roomID) {
    global.$LOG.entry('History', `Deactivating room ${roomID}`);
    global.$DATA.history.rooms[roomID].close();
    delete global.$DATA.history.rooms[roomID];
  }
  async addMessage(data) {
    var {timestamp, username, roomID, content} = data;
    var message = {username, content};
    global.$DATA.history.rooms[roomID].entry(['M', timestamp, username, content]);
  }
  async getChatHistory(roomID) {
    var history = RHF.read(makeFilename(roomID));
    return history;
  }
}
