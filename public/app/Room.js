
class Room {
  constructor(data) {
    this.ID = data.ID;
    this.name = data.name;
    this.owner = data.owner;
    this.isPublic = data.isPublic;
    this.history = data.history;
    this.users = data.users;
    this.passcode = data.passcode;
    this.status = {};
    var status = {0:'offline', 1:'away', 2:'active'};
    for (var [key, val] of Object.entries(data.status)) this.status[key] = status[val];
    this.status[$USER.username] = 'away';
    this.active = false;
    this.messages = [];
    this.initalized = false;
  }
  show() {
    var container = $id('RoomContainer');
    container.hidden = false;
    RoomCreator.createHeaderElements(this, container);
    RoomCreator.createChatElements(this, container);
    RoomCreator.createOptionsElements(this, container);
    RoomCreator.createMemberElements(this, $id('RoomMembers'));
    API_SetRoomUserStatus($USER.username, this.ID, 'active');
    this.active = true;
    if (!this.initalized) {
      if (this.history) API_GetChatHistory($USER.username, this.ID);
    }
    for (var message of this.messages) RoomCreator.createMessage(message);
  }
  hide() {
    var room = $APP.room;
    removeChildren($id('RoomContainer'));
    removeChildren($id('RoomMembers'));
    $id('RoomContainer').hidden = true;
    $id('RoomMembers').hidden = true;
    API_SetRoomUserStatus($USER.username, room.ID, 'away');
    room.active = false;
  }
  onUserStatus(data) {
    if (!this.active) return;
    this.status[data.username] = data.status;
    var statusTips = {
      offline: 'This user is offline',
      away: 'This user is online',
      active: 'This user is active'
    };
    for (var cname of Object.keys(statusTips))
      $id(`userStatus_${data.username}`).classList.remove(cname);
    $id(`userStatus_${data.username}`).classList.add(data.status);
    $id(`userStatus_${data.username}`).title = statusTips[data.status];
  }
  onChatHistory(data) {
    console.log('History', data);
    this.messages = data;
    this.initalized = true;
    if (this.active) {
      for (var message of this.messages) RoomCreator.createMessage(message); }
  }
  onMessage(data) {
    console.log('Message', data);
    if (this.active) RoomCreator.createMessage(data);
    this.messages.push(data);
  }
  sendMessage() {
    var text = $id('ChatInput').value;
    if (!text.split(' ').join('').length) return;
    $id('ChatInput').value = '';
    API_SendMessage($USER.username, this.ID, text);
  }
  resetPasscode() {
    API_ResetPasscode($APP.room.ID);
  }
  newPasscode(passcode) {
    $id('Passcode').innerText = 'Room passcode: ' + passcode;
  }
}
