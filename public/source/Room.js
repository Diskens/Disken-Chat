const roomDomElements = {
  roomID: 'RoomID',
  roomUsersSlots: 'RoomUsersSlots'
}

class Room {
  constructor(data) {
    this.ID = data.ID;
    this.users = data.users;
    this.maxUsers = data.maxUsers;
    this.mapID = data.mapID;
    this.initialized = false;
    this.chat = new Chat();
    this.slotsDom = new SlotsDom(roomDomElements.roomUsersSlots,
      this.maxUsers, this.users);
    for (var user of this.users) triggerNewUserCss(user);
  }
  onStatusUpdate(data) {
    // TODO: This code has to be refactored
    if (data.type == 'join') {
      this.users.push(data.username);
      this.slotsDom.removeEmptySlot();
      this.slotsDom.addUserSlot(data.username);
      this.chat.announce(`${data.username} joined the room`);
      $ROOM.playAudio('join');
      triggerNewUserCss(data.username);
    } else if (data.type == 'leave') {
      this.users.splice(this.users.indexOf(data.username), 1);
      this.slotsDom.removeUserSlot(data.username);
      this.slotsDom.addEmptySlot();
      this.chat.announce(`${data.username} has left the room`);
      $ROOM.playAudio('leave');
    } else if (data.type == 'kickout') {
      this.users.splice(this.users.indexOf(data.username), 1);
      this.slotsDom.removeUserSlot(data.username);
      this.slotsDom.addEmptySlot();
      this.chat.announce(`${data.username} was kicked out of the room`);
      $ROOM.playAudio('leave');
    } else if (data.type == 'disconnect') {
      this.chat.announce(`${data.username} has disconnected. ` +
        `User that does not reconnect in 5 seconds is kicked out.`);
    } else if (data.type == 'reconnect') {
      this.chat.announce(`${data.username} reconnected`);
    }
  }
  attachRoomDOM() {
    this.chat.attachRoomDOM();
    $id(roomDomElements.roomID).innerText = `${$ROOM.ID}`;
  }
  toggleReady(evt) {
    $USER.isReady = !$USER.isReady;
    $id(roomDomElements.readyButton).innerText = $USER.isReady? 'Uneady' : 'Ready';
    $ROOM.slotsDom.setSlotReadyStatus($USER.username, $USER.isReady);
    API_StatusUpdate($SOCKET.id, $USER.username, $ROOM.ID, $USER.isReady);
  }
  playAudio(variant) {
    let audio = new Audio(`/audio/${variant}.${$ROOM.audioType}`);
    console.log('[Audio]', variant, audio);
    audio.play();
  }
}


function formatTime(time) {
  var h = time.getHours(); if (h < 10) h = '0'+h;
  var m = time.getMinutes(); if (m < 10) m = '0'+m;
  return h + ':' + m;
}

function triggerNewUserCss(username) {
  API_GetUserColor(username);
}
