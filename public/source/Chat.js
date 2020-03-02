const ChatDomElements = {
  chatInput: 'ChatInput',
  chatContent: 'ChatContent',
}

class Chat {
  constructor() {}
  attachLobbyDOM() {
    var chatInput = $id(ChatDomElements.chatInput)
    chatInput.addEventListener('keyup', $GAME.chat.send);
    var chatContent = $id(ChatDomElements.chatContent);
    chatContent.onclick = function(evt) {chatContent.focus()};
    chatContent.scrollTop = chatContent.scrollHeight;
  }
  newMessage(player, text) {
    $GAME.chat.createEntry('message', `${player}: ${text}`);
  }
  announce(text) {
    $GAME.chat.createEntry('announcement', text);
  }
  send(evt) {
    if (evt.key != 'Enter') return;
    var target = evt.target;
    if (target.value == '') return;
    API_ChatMessage($SOCKET.id, $PLAYER.username, $GAME.ID, target.value);
    target.value = '';
  }
  clearHistory() {
    removeChildren($id(ChatDomElements.chatContent));
  }
  createEntry(cssClass, text) {
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
    var container = $id(ChatDomElements.chatContent);
    container.appendChild(mainElm);
    container.scrollTop = container.scrollHeight;
  }
}
