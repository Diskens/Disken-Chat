
class DomSection {
  constructor(id, permissions, header=false) {
    this.section = $id(id);
    this.permissions = permissions;
    this.header = header;
  }
  hide() {
    this.section.hidden = true;
    $id('Header').hidden = true
  }
  show() {
    this.section.hidden = false;
    if (this.header) $id('Header').hidden = false;
  }
}


class Permissions {
  constructor(user=null, inRoom=null) {
    if (inRoom) user = true;
    this.user = user;
    this.inRoom = inRoom;
  }
  resolve(userData) {
    if (userData == undefined) { return !this.user; }
    if (userData != undefined && this.user == false) return false;
    if (!userData.inRoom && this.inRoom) return false;
    return true;
  }
}


function switchTo(id) {
  var section = $DOM_SECTIONS[id];
  if (section.permissions.resolve($USER)) {
    for (var other of Object.values($DOM_SECTIONS)) other.hide();
    section.show();
    setCookie('Section', id);
    return true;
  }
  return false;
}

function back() {
  if (!switchTo('home')) switchTo('login');
}
