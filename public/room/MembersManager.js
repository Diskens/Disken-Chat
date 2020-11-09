
class MembersManager {
  constructor(room) {
    this.members = {};
  }
  addMembers(members) {
    for (let member of members) {
      this.members[member.userID] = member;
    }
  }
  markStatus(userID, status) {
    console.log('Status of', this.members[userID], 'changed to', status)
  }
}
