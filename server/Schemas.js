const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const usersSchema = new Schema({
  username: String,
  email: String,
  password: String,
  sessionID: String,
  isOnline: Boolean,
  joined: Date
});
mongoose.model('Users', usersSchema);

const roomSchema = new Schema({
  name: String,
  passcode: String,
  created: Date,
  owner: {
    type: ObjectId,
    ref: 'Users'
  }
});
mongoose.model('Room', roomSchema);
