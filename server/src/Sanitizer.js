
class Sanitizer {
  constructor() {}

  _sanitize(what, schema, exclude) {
    let sanitized = {};
    for (let key of Object.keys(schema)) {
      if (exclude.includes(key)) continue;
      sanitized[key] = what[key];
    }
    sanitized.ID = what._id;
    return sanitized;
  }

  sanitizeUser(user) {
    let schema = require('../Schemas').usersSchema.obj;
    return this._sanitize(user, schema, ['password', 'sessionID']);
  }

  sanitizeRoom(room) {
    let schema = require('../Schemas').roomsSchema.obj;
    return this._sanitize(room, schema, ['passcode']);
  }
}
module.exports = new Sanitizer();
