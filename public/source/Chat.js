const ChatDomElements = {
  chatInput: 'ChatInput',
  chatContent: 'ChatContent',
}

class Chat {
  constructor() {
    this.typing = false;
    this.typingElms = {};
  }
  attachRoomDOM() {
    var chatInput = $id(ChatDomElements.chatInput)
    chatInput.addEventListener('keyup', $ROOM.chat.send);
    chatInput.addEventListener('keyup', $ROOM.chat.checkIsTyping);
    var chatContent = $id(ChatDomElements.chatContent);
    chatContent.onclick = function(evt) {chatContent.focus()};
    chatContent.scrollTop = chatContent.scrollHeight;
  }
  setIsTyping(username, status) {
    if (status) {
      if (this.typingElms[username]) return;
      this.typingElms[username] = $ROOM.chat.createEntry(`${username} is typing...`, ['typing']);
    } else {
      try {this.typingElms[username].parentNode.removeChild(this.typingElms[username]);}
      catch (err) {}
      delete this.typingElms[username];
    }
  }
  checkIsTyping(evt) {
    var typing = $id(ChatDomElements.chatInput).value.length > 5;
    if (typing != this.typing) API_SetIsTyping(typing);
    this.typing = typing;
  }
  newMessage(user, text) {
    var classList = [`user_${user}`];
    if (user != $USER.username) $ROOM.playAudio('message');
    $ROOM.chat.createEntry(`${user}: ${text}`, classList);
  }
  announce(text) {
    $ROOM.chat.createEntry(text, ['announcement']);
  }
  send(evt) {
    if (evt.key != 'Enter') return;
    var target = evt.target;
    if (target.value == '') return;
    API_ChatMessage($SOCKET.id, $USER.username, $ROOM.ID, target.value);
    target.value = '';
  }
  clearHistory() {
    removeChildren($id(ChatDomElements.chatContent));
  }
  createEntry(text, classList) {
    var time = new Date(Date.now());
    var timeElm = document.createElement('span');
    timeElm.innerText = formatTime(time)
    timeElm.classList.add('chatTime');
    var textElm = document.createElement('span');
    textElm.innerHTML = this.linkify(text);
    var mainElm = document.createElement('div');
    mainElm.appendChild(timeElm);
    mainElm.appendChild(textElm);
    mainElm.classList.add('chatEntry');
    for (var cssClass of classList) mainElm.classList.add(cssClass);
    var container = $id(ChatDomElements.chatContent);
    container.appendChild(mainElm);
    container.scrollTop = container.scrollHeight;
    return mainElm;
  }
  linkify(text) {
    // Method downloaded from https://stackoverflow.com/a/8943487/12987579
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url) {
      return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });
  }
}
