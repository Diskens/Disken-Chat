const FileStream = require('../utilities/FileStream').FileStream;
const fs = require('fs');

// Writer class for Room History File format
exports.RHF = class RHF extends FileStream {
  constructor(filename) {
    super(filename);
    this.lastUsed = new Date(Date.now());
  }
  entry(data) {
    var data = data.join('|');
    this.append(data+'\n');
  }
  static read(filename) {
    var raw = fs.readFileSync(filename, 'utf8');
    var entries = raw.split('\n');
    var data = [];
    for (var entry of entries) {
      var line = entry.split('|');
      var [entryType, timestamp, username, content] = entry.split('|');
      if (entryType == '') continue;
      timestamp = parseInt(timestamp);
      data.push({entryType, timestamp, username, content});
    }
    return data;
  }
  static create(filename) {
    var stream = fs.createWriteStream(filename, {flags:'w'});
    stream.write('');
  }
}
