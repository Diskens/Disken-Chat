
class Application {
  constructor() {
    this.status = 0;
    this.switchHomeSub('rooms');
    this.rooms = {};
    this.room = null;
    this.initalized = false;
  }
  begin() {
    this.loadUserRooms();
    setTimeout(function () {
      API_Ping();
    }, 10000);
  }
  loadUserRooms() {
    API_GetUserRooms($USER.username, $SOCKET.id);
  }
  onUserRoomsLoaded(rooms) {
    var container = $id('HomeSubRooms').childNodes[2];
    $empty(container);
    for (var data of rooms) {
      const room = new Room(data);
      API_SetRoomUserStatus($USER.username, room.ID, 'away');
      this.rooms[room.ID] = room;
      var entry = RoomCreator.createListingEntry(room, () => {this.showRoom(room.ID);});
      container.appendChild(entry);
    }
    this.initalized = true;
  }
  showRoom(id) {
    if (this.room) {
      if (id == this.room.ID && this.room.active) return;
      if (this.room.active) this.room.hide();
    }
    this.room = this.rooms[id];
    this.room.show();
  }
  switchHomeSub(name) {
    if (name=='rooms' && $USER) this.loadUserRooms();
    var subSections = {
      rooms: $id('HomeSubRooms'), create: $id('HomeSubCreate'),
      join: $id('HomeSubJoin'), browse: $id('HomeSubBrowse')
    };
    for (var sub of Object.values(subSections)) sub.hidden = true;
    subSections[name].hidden = false;
  }
  toggleSideBar() {
    $id('HomeSideBar').classList.toggle('HomeSideBarHidden');
  }
}
