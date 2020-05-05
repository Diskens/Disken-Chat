const FileStream = require('../utilities/FileStream').FileStream;
const fs = require('fs');

let bufferToB64 = (content) => {
  return Buffer.from(content, 'binary').toString('base64');
}

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
  replace(filename, line, column, data) {
    var current = fs.readFileSync(filename, 'utf8').split('\n');
    var entry = current[line].split('|');
    entry[column] = data;
    current[line] = entry.join('|');
    var stream = fs.createWriteStream(filename, {flags:'w'});
    stream.write(current.join('\n'));
  }
  static read(filename) {
    var raw = fs.readFileSync(filename, 'utf8');
    var entries = raw.split('\n');
    var data = [];
    for (var entry of entries) {
      var line = entry.split('|');
      var [entryType, ID, timestamp, username, reactions, content] = entry.split('|');
      if (entryType == '') continue;
      ID = parseInt(ID);
      timestamp = parseInt(timestamp);
      reactions = reactions.split(',');
      if (reactions[0] == '') reactions.splice(0, 1);
      if (entryType == 'I')
        content = bufferToB64(fs.readFileSync(content, 'binary'));
      data.push({entryType, ID, timestamp, username, reactions, content});
    }
    return data;
  }
  static create(filename) {
    var stream = fs.createWriteStream(filename, {flags:'w'});
    stream.write('');
  }
}
