const lobbyDomIDs = {
  chatInput: 'ChatInput',
  chatContent: 'ChatContent',
  lobbyGameID: 'LobbyGameID',
  readyButton: 'LobbyReadyButton',
  lobbyMapName: 'LobbyMapName'
}

class Game {
  constructor(data) {
    this.ID = data.ID;
    this.players = data.players;
    this.mapID = data.mapID;
    this.dom = {};
    this.initialized = false;
  }
  attachLobbyContent() {
    $id(lobbyDomIDs.lobbyGameID).innerText = `${$GAME.ID}`;
    $id(lobbyDomIDs.lobbyMapName).innerText = $GAME.mapID;
    $id(lobbyDomIDs.readyButton).onclick = $GAME.toggleReady;
    var chatInput = $id(lobbyDomIDs.chatInput)
    chatInput.addEventListener('keyup', $GAME.chatSend);
    var chatContent = $id(lobbyDomIDs.chatContent);
    chatContent.onclick = function(evt) {chatContent.focus()};
    chatContent.scrollTop = chatContent.scrollHeight;
    removeChildren(chatContent); // clear chat history
  }
  chatSend(evt) {
    if (evt.key != 'Enter') return;
    var target = evt.target;
    if (target.value == '') return;
    API_ChatMessage($SOCKET.id, $PLAYER.username, $GAME.ID, target.value);
    target.value = '';
  }
  createChatElement(cssClass, text) {
    var time = new Date(Date.now());
    var timeElm = document.createElement('span');
    timeElm.innerText = formatTime(time)
    timeElm.classList.add('chatTime');
    var textElm = document.createElement('span');
    textElm.innerText = text;
    var mainElm = document.createElement('div');
    mainElm.appendChild(timeElm);
    mainElm.appendChild(textElm);
    mainElm.classList.add('chatEntry');
    mainElm.classList.add(cssClass);
    var container = $id(lobbyDomIDs.chatContent);
    container.appendChild(mainElm);
    container.scrollTop = container.scrollHeight;
  }
  onNewMessage(player, text) {
    $GAME.createChatElement('message', `${player}: ${text}`);
  }
  onNewAnnouncement(type, text) {
    $GAME.createChatElement('announcement', text);
  }
  toggleReady(evt) {
    $PLAYER.isReady = !$PLAYER.isReady;
    $id(lobbyDomIDs.readyButton).innerText = $PLAYER.isReady? 'Ready' : 'Unready';
    API_SetReadyStatus($SOCKET.id, $PLAYER.username, $GAME.ID, $PLAYER.isReady);
  }
}


function formatTime(time) {
  var h = time.getHours(); if (h < 10) h = '0'+h;
  var m = time.getMinutes(); if (m < 10) m = '0'+m;
  return h + ':' + m;
}
