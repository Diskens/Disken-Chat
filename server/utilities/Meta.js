const fs = require('fs');

const empty = {
  onlineCount: 0,
  totalRooms: 0,
  tzOffset: 0
}

exports.Meta = class Meta {
  constructor(fileLocation) {
    this.fileLocation = fileLocation;
  }
  reset() {
    this._set('onlineCount', 0);
  }
  setVersion(release, version) {
    this._set('version', version);
    this._set('release', release);
  }
  createEmpty(release, version) {
    fs.writeFileSync(this.fileLocation, JSON.stringify(empty));
    this.setVersion(release, version);
  }
  getVersion() { return this._get('version'); }
  getRelease() { return this._get('release'); }
  getTotalRoomsCreated() { return this._get('totalRooms'); }
  getNextRoomID() { return this._incr('totalRooms'); }
  incrOnlineCount() { return this._incr('onlineCount'); }
  decrOnlineCount() { return this._decr('onlineCount'); }
  setTzOffset(minutes) { this._set('tzOffset', minutes); }
  getTzOffset() { return this._get('tzOffset'); }

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
