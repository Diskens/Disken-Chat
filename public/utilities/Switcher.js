
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
  constructor(user=0, inGame=1) {
    if (inGame==2 && !user) user = 1;
    this.user = user; // 0 = anyone, 1 = user, 2 = admin
    this.inGame = inGame; // 0 = only false, 1 = any, 2 = only true
    this.lastDenyReason = null;
  }
  get() {
    this.lastDenyReason = null;
    if (!this.user) return true;
    if (!$LOGGEDIN) {
      this.lastDenyReason = 'notlogged'; return false;} // user is not 0 so $LOGGEDIN must be true
    if (this.user == 2 && !$PLAYER.permissions) {
      this.lastDenyReason = 'notadmin'; return false;}
    if (this.inGame == 2 && !$PLAYER.inGame) {
      this.lastDenyReason = 'notingame'; return false;}
    if (!this.inGame && $PLAYER.inGame) {
      this.lastDenyReason = 'ingame'; return false;}
    return true;
  }
}

function hideAllSections() {
  for (var section of Object.values(domSections)) section.hide();
}

function switchSection(sectionName) {
  console.warn('[Switch] Switching to', sectionName);
  $SECTION = sectionName;
  setCookie('Section', sectionName);
  hideAllSections();
  if (!domSections[sectionName].show()) switchSection('home');
}

function autoSwitchHeader() {
  $id('LoggedOutHeader').hidden = $LOGGEDIN;
  $id('LoggedInHeader').hidden = !$LOGGEDIN;
  if ($PLAYER != undefined)
    $id('adminHeader').hidden = $PLAYER.permissions? false : true;
}

function autoSwitchPlayButton() {
  var button = $id('PlayButton');
  if ($PLAYER == undefined) {
    button.onclick = () => {popupMessage('You have to be logged in to play');};
    button.innerText = 'Play';
  } else {
    if ($PLAYER.inGame) {
      button.onclick = () => {switchSection('lobby');};
      button.innerText = 'Return to lobby';
    } else {
      button.onclick = () => {switchSection('lobbiesList');};
      button.innerText = 'Play';
    }
  }
}
