
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
    this.lastSender = '';
    this.fileReader = new FileReader();
    this.fileReader.onload = ()=>{this.onSelectedFileLoaded(this.fileReader.result)};
  }
  showStoredMessages() {
    for (var entry of this.messages) {
      if (entry.entryType == 'M') RoomCreator.createMessage(this, entry);
      else if (entry.entryType == 'I') RoomCreator.createImage(this, entry);
    }
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
    this.showStoredMessages();
  }
  hide() {
    var room = $APP.room;
    $empty($id('RoomContainer'));
    $empty($id('RoomMembers'));
    $id('RoomContainer').hidden = true;
    $id('RoomMembers').hidden = true;
    API_SetRoomUserStatus($USER.username, room.ID, 'away');
    room.active = false;
    room.lastSender = '';
  }
  onUserStatus(data) {
    if (!this.active) return;
    this.status[data.username] = data.status;
    var element = $id(`userStatus_${data.username}`);
    if (element == undefined) {
      RoomCreator.addMemberElement(this, data.username, $id('RoomMembers'));
      return;
    }
    var statusTips = {
      offline: 'This user is offline',
      away: 'This user is online',
      active: 'This user is active'
    };
    for (var cname of Object.keys(statusTips))
      element.classList.remove(cname);
    element.classList.add(data.status);
    element.title = statusTips[data.status];
  }
  onChatHistory(data) {
    this.messages = data;
    this.initalized = true;
    if (!this.active) return;
    this.showStoredMessages();
  }
  onMessage(data) {
    if (this.active) RoomCreator.createMessage(this, data);
    this.messages.push(data);
  }
  sendMessage() {
    var text = $id('ChatInput').value;
    if (!text.split(' ').join('').length) return;
    $id('ChatInput').value = '';
    API_SendMessage($USER.username, this.ID, text);
  }
  sendReaction(messageID) {
    API_SendReaction($USER.username, this.ID, messageID);
  }
  onReaction(data) {
    var index = 0; var found = false;
    for (var message of this.messages) {
      if (message.ID == data.ID) {found = true; break;}
      index += 1;
    }
    if (!found) { console.error('Message not found'); return; }
    this.messages[index].reactions = data.reactions;
    RoomCreator.updateReaction(this, data);
  }
  onImageSelected(self, evt) {
    popup('Image selected');
    var files = evt.target.files;
    if (!files.length) return;
    var file = files[0];
    self.fileReader.readAsDataURL(file);
  }
  onSelectedFileLoaded(data) {
    API_SendImage($USER.username, this.ID, data);
  }
  onImageDropped(self, evt) {
    /* This method is based on example from
    https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
    Section "Process the drop" */
    if (!evt.dataTransfer.items) return;
    for (var i = 0; i < evt.dataTransfer.items.length; i++) {
      if (evt.dataTransfer.items[i].kind === 'file') {
        var file = evt.dataTransfer.items[i].getAsFile();
        self.fileReader.readAsDataURL(file);
      }
    }
  }
  onImage(data) {
    if (this.active) RoomCreator.createImage(this, data);
    this.messages.push(data);
  }
  resetPasscode() {
    API_ResetPasscode($APP.room.ID);
  }
  newPasscode(passcode) {
    $id('Passcode').innerText = 'Room passcode: ' + passcode;
  }
}
