const RHF = require('./utilities/RHF.js').RHF;

function makeFilename(roomID) { return `data/history/room_${roomID}.rhf`; }

exports.HistoryData = class HistoryData {
  constructor() {
    this.rooms = {};
  }
  createRoom(roomID) {
    var filename = makeFilename(roomID);
    var rhf = RHF.create(makeFilename(roomID));
  }
  activation(room, delta) {
    if (!room.activeCount && delta > 0) global.$DATA.history.activateRoom(room.ID);
    if (room.activeCount == 1 && delta < 0) global.$DATA.history.deactivateRoom(room.ID);
  }
  activateRoom(roomID) {
    global.$LOG.entry('History', `Activating #${roomID}`);
    global.$DATA.history.rooms[roomID] = new RHF(makeFilename(roomID));
  }
  deactivateRoom(roomID) {
    global.$LOG.entry('History', `Deactivating #${roomID}`);
    global.$DATA.history.rooms[roomID].close();
    delete global.$DATA.history.rooms[roomID];
  }
  addMessage(data) {
    var {ID, timestamp, username, roomID, content} = data;
    var message = {username, content};
    global.$DATA.history.rooms[roomID].entry(['M', ID, timestamp, username,
      [/*reactions*/], content]);
  }
  addReaction(data) {
    global.$LOG.entry('History', `${data.username} reacted to message in #${data.roomID}`);
    var filename = makeFilename(data.roomID);
    var history = RHF.read(filename);
    var line = 0;
    for (var entry of history) {
      if (entry.ID == data.ID) break;
      line += 1;
    }
    var reactions = history[line].reactions;
    var change = 1;
    if (reactions.includes(data.username)) {
      var index = reactions.indexOf(data.username);
      reactions.splice(index, 1);
      change = -1;
    } else {
      reactions.push(data.username);
    }
    global.$DATA.history.rooms[data.roomID].replace(filename, line, 4,
      reactions.join(','));
    return {change, reactions};
  }
  getChatHistory(roomID) {
    var history = RHF.read(makeFilename(roomID));
    return history;
  }
}
