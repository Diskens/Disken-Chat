
function createTimeString(timestamp) {
  var now = Date.now();
  var today = new Date(now).toISOString().substring(0, 10);
  var msgDay = new Date(timestamp).toISOString().substring(0, 10);
  if (today == msgDay) return new Date(timestamp).toISOString().substring(11, 16);
  return 'before last midnight (TODO)'; // TODO
}

const RoomCreator = {
  createIcons: (room) => {
    var publicIcon = room.isPublic ?
      PropertyIcons.createPublicIcon() : PropertyIcons.createClosedIcon();
    var historyIcon = room.history ?
      PropertyIcons.createHistoryIcon() : PropertyIcons.createNoHistoryIcon();
    var ownedIcon = room.owner == $USER.username ?
      PropertyIcons.createOwnedIcon() : PropertyIcons.createNotOwnedIcon();
    return [publicIcon, historyIcon, ownedIcon];
  },
  createListingEntry: (room, onclick) => {
    var entry = $create('a');
    entry.classList.add('entry');
    entry.onclick = onclick;
    var name = $create('span');
    name.classList.add('name');
    name.innerText = room.name;
    entry.appendChild(name);
    for (var icon of RoomCreator.createIcons(room)) entry.appendChild(icon);
    var clear = $create('div');
    clear.classList.add('clear');
    entry.appendChild(clear);
    return entry;
  },
  createHeaderElements: (room, container) => {
    var header = $create('div');
    header.id = 'RoomHeader';
    container.appendChild(header);
    var title = $create('p');
    title.innerText = room.name;
    header.appendChild(title);
    var hide = $create('button');
    hide.style['background-image'] = "url('../images/cross.png')";
    hide.title = 'Hide';
    hide.onclick = room.hide;
    header.appendChild(hide);
    var inviteOpts = $create('button');
    inviteOpts.style['background-image'] = "url('../images/options.png')";
    inviteOpts.title = 'Hide';
    inviteOpts.onclick = () => {
      var options = $id('RoomOptions'); options.hidden = !options.hidden;};
    header.appendChild(inviteOpts);
    for (var icon of RoomCreator.createIcons(room)) header.appendChild(icon);
    var clear = $create('div');
    clear.classList.add('clear');
    header.appendChild(clear);
  },
  createChatElements: (room, container) => {
    var chat = $create('div');
    chat.id = 'ChatContent';
    container.appendChild(chat);
    var spacer = $create('div');
    spacer.style.height = '2em';
    chat.appendChild(spacer);
    var input = $create('input');
    input.id = 'ChatInput';
    input.type = 'text';
    input.placeholder = 'Type your message here. Press enter to send.';
    addEventListener('keydown',
      (evt) => { if (evt.key == 'Enter') $APP.room.sendMessage(); });
    container.appendChild(input);
  },
  createOptionsElements: (room, container) => {
    var options = $create('div');
    options.hidden = true;
    options.id = 'RoomOptions';
    options.classList.add('roomOptions');
    container.appendChild(options);
    var joinCode = $create('p');
    joinCode.id = 'Passcode';
    joinCode.innerText = 'Room passcode: ' + room.passcode;
    options.appendChild(joinCode);
    var resetCode = $create('button');
    resetCode.innerText = 'Reset code';
    resetCode.onclick = $APP.room.resetPasscode;
    options.appendChild(resetCode);
  },
  createMemberElements: (room, container) => {
    container.hidden = false;
    var title = $create('h4');
    title.innerText = 'Room members';
    container.appendChild(title);
    for (var user of room.users) {
      var entry = $create('a');
      container.appendChild(entry);
      entry.classList.add('entry');
      entry.classList.add('user');
      var status = $create('input');
      status.id = `userStatus_${user}`;
      status.classList.add('property');
      status.classList.add('status');
      status.classList.add(room.status[user]);
      entry.appendChild(status);
      var name = $create('span');
      name.classList.add('name');
      entry.appendChild(name);
      name.innerText = user;
      if (user == room.owner) {
        var owner = PropertyIcons.createOwnerUserIcon();
        entry.appendChild(owner);
        var clear = $create('div');
        clear.classList.add('clear');
        entry.appendChild(clear);
      }
    }
  },
  createMessage: (data) => {
    var chat = $id('ChatContent');
    var container = $create('div');
    if (data.username == $USER.username) container.classList.add('own');
    chat.appendChild(container);
    container.classList.add('message');
    if (data.username != $USER.username) {
      var user = $create('span');
      user.classList.add('user');
      user.innerText = data.username;
      container.appendChild(user);
    }
    var message = $create('span');
    message.classList.add('inner');
    message.title = createTimeString(data.timestamp);
    container.appendChild(message);
    message.innerText = data.content;
    chat.scrollTop = chat.scrollHeight;
  }
}