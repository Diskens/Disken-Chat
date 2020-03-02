
class SlotsDom {
  constructor(containerID, maxPlayers, players) {
    this.playerSlots = {};
    this.slotsContainer = $id(containerID);
    for (var player of players)
      this.addPlayerSlot(player)
    for (var index=0; index<maxPlayers-players.length; index++)
      this.addEmptySlot()
  }
  addPlayerSlot(username) {
    var slot = document.createElement('div');
    slot.classList.add('playerSlot');
    slot.innerText = username;
    $id(lobbyDomElements.lobbyPlayerSlots).appendChild(slot);
    this.playerSlots[username] = slot;
  }
  removePlayerSlot(username) {
    var slot = this.playerSlots[username];
    slot.parentNode.removeChild(slot);
    delete this.playerSlots[username];
  }
  addEmptySlot() {
    var slot = document.createElement('div');
    slot.classList.add('playerSlot');
    slot.classList.add('empty');
    slot.innerText = '[Empty slot]'
    $id(lobbyDomElements.lobbyPlayerSlots).appendChild(slot);
  }
  removeEmptySlot() {
    var slots = Array.from($cn('empty'));
    var slot = slots.pop();
    slot.parentNode.removeChild(slot);
  }
  setSlotReadyStatus(username, status) {
    var slot = this.playerSlots[username];
    if (status) slot.classList.add('ready');
    else slot.classList.remove('ready');
  }
  removeAll() {
    var slots = Array.from($cn('empty'));
    for (var slot of slots) slot.parentNode.removeChild(slot);
    for (var slot of Object.values(this.playerSlots)) slot.parentNode.removeChild(slot);
  }
}
