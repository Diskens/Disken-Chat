
exports.StatusApi = class StatusApi {
  constructor() {
    this.callbacks = {};
  }
  async setStatusAllRooms(username, status) {
    var userRooms = (await global.$DATA.rooms.getUserRooms(username)).rooms;
    for (var room of userRooms) global.$APIS.status.setStatus(username, room, status);
  }
  async setStatus(username, room, status) {
    var result = await global.$DATA.rooms.setUserStatus(room.ID, username, status);
    global.$LOG.entry('Status', `Status of ${username} in #${room.ID}: ${status} <delta ${result.delta}>`);
    if (result.previous == status) return;
    global.$DATA.accounts.broadcast(room.users, 'RoomUserStatus',
      {roomID:room.ID, username, status:['offline', 'away', 'active'][status]});
    global.$DATA.history.activation(room, result.delta);
  }
}
