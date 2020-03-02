const lobbyDomElements = {
  lobbyGameID: 'LobbyGameID',
  lobbyMapName: 'LobbyMapName',
  readyButton: 'LobbyReadyButton',
  lobbyPlayerSlots: 'LobbyPlayerSlots'
}

class Game {
  constructor(data) {
    this.ID = data.ID;
    this.players = data.players;
    this.maxPlayers = data.maxPlayers;
    this.mapID = data.mapID;
    this.initialized = false;
    this.chat = new Chat();
    this.slotsDom = new SlotsDom(lobbyDomElements.lobbyPlayerSlots,
      this.maxPlayers, this.players);
  }
  onStatusUpdate(data) {
    // TODO: This code has to be refactored
    if (data.type == 'join') {
      this.players.push(data.username);
      this.slotsDom.removeEmptySlot();
      this.slotsDom.addPlayerSlot(data.username);
      this.chat.announce(`${data.username} joined the lobby`);
    } else if (data.type == 'leave') {
      this.players.splice(this.players.indexOf(data.username), 1);
      this.slotsDom.removePlayerSlot(data.username);
      this.slotsDom.addEmptySlot();
      this.chat.announce(`${data.username} has left the lobby`);
    } else if (data.type == 'kickout') {
      this.players.splice(this.players.indexOf(data.username), 1);
      this.slotsDom.removePlayerSlot(data.username);
      this.slotsDom.addEmptySlot();
      this.chat.announce(`${data.username} was kicked out of the lobby`);
    } else if (data.type == 'disconnect') {
      this.chat.announce(`${data.username} has disconnected. ` +
        `Player that does not reconnect in 5 seconds is kicked out.`);
    } else if (data.type == 'reconnect') {
      this.chat.announce(`${data.username} reconnected`);
    } else if (data.type == 'ready') {
      this.slotsDom.setSlotReadyStatus(data.username, data.details.status);
    }
  }
  attachLobbyDOM() {
    this.chat.attachLobbyDOM();
    $id(lobbyDomElements.lobbyGameID).innerText = `${$GAME.ID}`;
    $id(lobbyDomElements.lobbyMapName).innerText = $GAME.mapID;
    $id(lobbyDomElements.readyButton).onclick = $GAME.toggleReady;
  }
  toggleReady(evt) {
    $PLAYER.isReady = !$PLAYER.isReady;
    $id(lobbyDomElements.readyButton).innerText = $PLAYER.isReady? 'Uneady' : 'Ready';
    $GAME.slotsDom.setSlotReadyStatus($PLAYER.username, $PLAYER.isReady);
    API_StatusUpdate($SOCKET.id, $PLAYER.username, $GAME.ID, $PLAYER.isReady);
  }
}


function formatTime(time) {
  var h = time.getHours(); if (h < 10) h = '0'+h;
  var m = time.getMinutes(); if (m < 10) m = '0'+m;
  return h + ':' + m;
}
