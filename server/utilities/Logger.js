const FileStream = require('../utilities/FileStream').FileStream;

exports.Logger = class Logger extends FileStream {
  constructor(filename, tzOffset) {
    tzOffset = tzOffset * 60 * 1000; // time zone offset in minutes
    var date = new Date(Date.now()+tzOffset).toISOString().substring(0, 10);
    super(filename.replace('$DATE', date));
    this.fnTemplate = filename; this.date = date; this.tzOffset = tzOffset;
  }
  entry(issuer, message) {
    var now = new Date(Date.now()+this.tzOffset).toISOString();
    var date = now.substring(0, 10);
    if (date != this.date) {
      this.close();
      this.reinit(this.fnTemplate.replace(date));
    }
    var time = now.substring(11, 19);
    var text = `@${time} [${issuer}] ${message}`;
    console.log(text);
    this.append(text+'\n');
  }
  newSession(meta) {
    this.append('\n\n\n');
    var version = `${meta.getVersion()} ${meta.getRelease()}`;
    this.entry('Main', `Server started (v${version})`);
  }
}
