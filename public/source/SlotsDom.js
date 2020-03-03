
class SlotsDom {
  constructor(containerID, maxUsers, users) {
    this.userSlots = {};
    this.slotsContainer = $id(containerID);
    for (var user of users)
      this.addUserSlot(user)
    for (var index=0; index<maxUsers-users.length; index++)
      this.addEmptySlot()
  }
  addUserSlot(username) {
    var slot = document.createElement('div');
    slot.classList.add('userSlot');
    slot.innerText = username;
    $id(roomDomElements.roomUsersSlots).appendChild(slot);
    this.userSlots[username] = slot;
  }
  removeUserSlot(username) {
    var slot = this.userSlots[username];
    slot.parentNode.removeChild(slot);
    delete this.userSlots[username];
  }
  addEmptySlot() {
    var slot = document.createElement('div');
    slot.classList.add('userSlot');
    slot.classList.add('empty');
    slot.innerText = '[Empty slot]'
    $id(roomDomElements.roomUsersSlots).appendChild(slot);
  }
  removeEmptySlot() {
    var slots = Array.from($cn('empty'));
    var slot = slots.pop();
    slot.parentNode.removeChild(slot);
  }
  setSlotReadyStatus(username, status) {
    var slot = this.userSlots[username];
    if (status) slot.classList.add('ready');
    else slot.classList.remove('ready');
  }
  removeAll() {
    var slots = Array.from($cn('empty'));
    for (var slot of slots) slot.parentNode.removeChild(slot);
    for (var slot of Object.values(this.userSlots)) slot.parentNode.removeChild(slot);
  }
}
