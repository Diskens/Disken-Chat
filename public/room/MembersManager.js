
class MembersManager {
  constructor(room) {
    this.room = room;
    this.members = {};
  }

  addMember(userID, username) {
    if (username == undefined) username = userID;
    this.members[userID] = {userID, username};
  }
  addMembers(members) {
    for (let member of members) this.addMember(member);
  }

  setUsernames(usernames) {
    for (let [userID, username] of Object.entries(usernames))
      this.members[userID].username = username;
  }
  getUsername(userID) {
    return this.members[userID].username;
  }
}
