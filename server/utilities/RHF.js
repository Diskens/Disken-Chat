const FileStream = require('../utilities/FileStream').FileStream;
const fs = require('fs');

let makeImgFilename = (roomID, msgID) => {
  return `data/images/img_${roomID}_${msgID}`;
}
let bufferToB64 = (content) => {
  return Buffer.from(content, 'binary').toString('base64');
}

// Writer / Parser class for Room History File format
exports.Parser = class Parser extends FileStream {
  constructor(filename) {
    super(filename);
    this.lastUsed = new Date(Date.now());
  }
  entry(entryType, raw) {
    var entry;
    switch (entryType) {
      case 'M': entry = new MessageBuilderEntry(raw); break;
      case 'I': entry = new ImageBuilderEntry(raw); break;
      default: return; break;
    }
    this.append(entry.build()+'\n');
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
    for (var raw of entries) {
      var entryType = raw.substring(0, 1);
      var entry;
      switch (entryType) {
        case 'M': entry = new MessageParserEntry(raw); break;
        case 'I': entry = new ImageParserEntry(raw); break;
        default: continue; break;
      }
      data.push(entry.parse());
    }
    return data;
  }
  static create(filename) {
    var stream = fs.createWriteStream(filename, {flags:'w'});
    stream.write('');
  }
}



class ParserEntry {
  constructor(raw) {
    this.raw = raw;
    this.config = {0:'entryType', 1:'ID', 2:'timestamp', 3:'username', 4:'reactions'};
    this.action = {
      ID: (a) => { return parseInt(a); },
      timestamp: (a) => { return parseInt(a); },
      reactions: (a) => { a = a.split(','); if (a[0]=='') a.splice(0,1); return a; }
    };
  }
  parse() {
    var result = {};
    var data = this.raw.split('|');
    for (var [index, key] of Object.entries(this.config)) {
      var attribute = data[index];
      if (this.action[key] != undefined) attribute = this.action[key](attribute);
      result[key] = attribute;
    }
    return result;
  }
}
class MessageParserEntry extends ParserEntry {
  constructor(raw) {
    super(raw);
    this.config[5] = 'content';
  }
}
class ImageParserEntry extends ParserEntry {
  constructor(raw) {
    super(raw);
    this.config[5] = 'header';
    this.config[6] = 'content';
    this.action['content'] = (a) => {return fs.readFileSync(a, 'utf8'); };
  }
}



class BuilderEntry {
  constructor(raw) {
    this.raw = raw;
    this.config = ['entryType', 'ID', 'timestamp', 'username', 'reactions'];
  }
  build() {
    var result = '';
    for (var key of this.config)
      result += this.raw[key] + '|';
    return result;
  }
}
class MessageBuilderEntry extends BuilderEntry {
  constructor(raw) {
    super(raw);
    this.config.push('content');
  }
}

class ImageBuilderEntry extends BuilderEntry {
  constructor(raw) {
    super(raw);
    this.config.push('header');
    this.config.push('filename');
    this.raw.filename = makeImgFilename(this.raw.roomID, this.raw.ID);
    global.$LOG.entry('History', `Saving ${this.raw.username}'s image in `+
      `#${this.raw.roomID}`);
  }
  build() {
    var result = super.build();
    var stream = fs.createWriteStream(this.raw.filename, {flags:'w'});
    stream.write(this.raw.content);
    return result;
  }
}
