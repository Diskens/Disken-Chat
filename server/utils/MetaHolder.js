const fs = require('fs');

exports.MetaHolder = class MetaHolder {
  constructor(fileLocation) {
    this.fileLocation = fileLocation;
  }
  getVersion() { return this._get('version'); }
  getRelease() { return this._get('release'); }
  getTotalRoomsCreated() { return this._get('totalRoomsCreated'); }
  getNextRoomID() { return this._incr('totalRoomsCreated'); }
  incrOnlineCount() { return this._incr('onlineCount'); }
  decrOnlineCount() { return this._decr('onlineCount'); }

  _get(key) {
    return JSON.parse(fs.readFileSync(this.fileLocation))[key];
  }
  _set(key, value) {
    var allData = JSON.parse(fs.readFileSync(this.fileLocation));
    allData[key] = value;
    fs.writeFileSync(this.fileLocation, JSON.stringify(allData));
  }
  _incr(key) {
    var current = this._get(key) + 1;
    this._set(key, current);
    return current;
  }
  _decr(key) {
    var current = this._get(key) - 1;
    this._set(key, current);
    return current;
  }
}
