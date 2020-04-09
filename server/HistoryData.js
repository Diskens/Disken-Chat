const RHF = require('./utilities/RHF.js').RHF;
var $LOG, $META;

function makeFilename(roomID) { return `data/history/room_${roomID}.rhf`; }

exports.HistoryData = class HistoryData {
  constructor(_log, _meta) {
    $LOG = _log; $META = _meta;
    this.rooms = {};
  }
  async createRoom(roomID) {
    var filename = makeFilename(roomID);
    var rhf = RHF.create(makeFilename(roomID));
  }
  activateRoom(roomID) {
    $LOG.entry('History', `Activating room ${roomID}`);
    this.rooms[roomID] = new RHF(makeFilename(roomID));
  }
  deactivateRoom(roomID) {
    $LOG.entry('History', `Deactivating room ${roomID}`);
    this.rooms[roomID].close();
    delete this.rooms[roomID];
  }
  async addMessage(data) {
    var {timestamp, username, roomID, content} = data;
    var message = {username, content};
    this.rooms[roomID].entry(['M', timestamp, username, content]);
  }
  async getChatHistory(roomID) {
    var history = RHF.read(makeFilename(roomID));
    return history;
  }
}
