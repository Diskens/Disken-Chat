const Datastore = require('../utils/Datastore.js').Datastore;

exports.DataHolder = class DataHolder {
  constructor(dbPath) {
    this.db = new Datastore(dbPath);
    this.db.loadDatabase();
  }
}
