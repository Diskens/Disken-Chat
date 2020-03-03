
class DomSection {
  constructor(id, permissions, onswitch) {
    this.section = $id(id);
    this.permissions = permissions;
    this.onswitch = onswitch;
  }
  hide() { this.section.hidden = true; }
  show() {
    var canSwitch = this.permissions.get();
    if (canSwitch) {
      this.section.hidden = false;
      if (this.onswitch !== undefined) this.onswitch();
    } else {
      console.warn('[DOMSection] Error: Can not access section',
      `${this.section.id}. DenyReason = ${this.permissions.lastDenyReason}`);
    }
    return canSwitch;
  }
}

class Permissions {
  constructor(user=0, inRoom=1) {
    if (inRoom==2 && !user) user = 1;
    this.user = user; // 0 = anyone, 1 = user, 2 = admin
    this.inRoom = inRoom; // 0 = only false, 1 = any, 2 = only true
    this.lastDenyReason = null;
  }
  get() {
    this.lastDenyReason = null;
    if (!this.user) return true;
    if (!$LOGGEDIN) {
      this.lastDenyReason = 'notlogged'; return false;} // user is not 0 so $LOGGEDIN must be true
    if (this.user == 2 && !$USER.permissions) {
      this.lastDenyReason = 'notadmin'; return false;}
    if (this.inRoom == 2 && !$USER.inRoom) {
      this.lastDenyReason = 'notinRoom'; return false;}
    if (!this.inRoom && $USER.inRoom) {
      this.lastDenyReason = 'inRoom'; return false;}
    return true;
  }
}

function hideAllSections() {
  for (var section of Object.values(domSections)) section.hide();
}

function switchSection(sectionName) {
  $SECTION = sectionName;
  setCookie('Section', sectionName);
  hideAllSections();
  if (!domSections[sectionName].show()) switchSection('home');
}

function autoSwitchHeader() {
  $id('LoggedOutHeader').hidden = $LOGGEDIN;
  $id('LoggedInHeader').hidden = !$LOGGEDIN;
  if ($USER != undefined)
    $id('adminHeader').hidden = $USER.permissions? false : true;
}

function autoSwitchPlayButton() {
  var button = $id('PlayButton');
  if ($USER == undefined) {
    button.onclick = () => {popupMessage('You have to be logged in to play');};
    button.innerText = 'Rooms';
  } else {
    if ($USER.inRoom) {
      button.onclick = () => {switchSection('room');};
      button.innerText = 'Return to room';
    } else {
      button.onclick = () => {switchSection('roomsList');};
      button.innerText = 'Rooms';
    }
  }
}
