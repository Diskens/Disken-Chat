
class Room {
  constructor(manager, data) {
    this.manager = manager;
    this.initialized = false; // activated at least once
    this.active = false;
    this.flags = {
      makeVisible: data.makeVisible,
      requirePasscode: data.requirePasscode
    };
    this.ID = data._id;
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
    this.manager.markMemberStatus(this.ID, 'active');
  }
  hide() {
    this.active = false;
    this.dom.hide();
    this.manager.markMemberStatus(this.ID, 'inactive');
  }

  sendMessage() {
    let message = this.dom.input.value;
    console.log('Message =', message);
  }
}
