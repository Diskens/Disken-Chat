const fs = require('fs');

exports.FileStream = class FileStream {
  constructor(filename) { this.reinit(filename); }
  reinit(filename) {
    this.filename = filename;
    this.stream = fs.createWriteStream(this.filename, {flags:'a'});
  }
  append(content) {
    this.stream.write(content);
  }
  close() {
    this.stream.end();
  }
}
