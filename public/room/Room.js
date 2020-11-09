
class Room {
  constructor(manager, data) {
    this.manager = manager;
    this.initialized = false; // activated at least once
    this.active = false;
    this.flags = {
      makeVisible: data.makeVisible,
      requirePasscode: data.requirePasscode
    };
    this.ID = data.ID;
    this.name = data.name;
    this.entries = new EntriesManager(this);
    this.uploader = new UploadManager(this);
    this.members = new MembersManager(this);
    this.members.addMembers(data.members);
    this.dom = new RoomDomManager(this);
  }
  initialize() {
    this.manager.getChatEntries(this.ID);
    this.initialized = true;
  }
  show() {
    if (!this.initialized) this.initialize();
    this.active = true;
    this.dom.show();
  }
  hide() {
    this.active = false;
    this.dom.hide();
  }

  sendTextEntry() {
    let content = this.dom.input.value;
    this.manager.newEntry(this.ID, 'text', content);
  }
}
