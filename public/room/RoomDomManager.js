
class RoomDomManager {
  constructor(room) {
    this.room = room;
    this.createDom();
  }
  show() {
    this.chatRoot.hidden = false;
    this.detailsRoot.hidden = false;
    this.roomName.hidden = false;
  }
  hide() {
    this.chatRoot.hidden = true;
    this.detailsRoot.hidden = true;
    this.roomName.hidden = true;
  }

  purge() {
    $remove(this.roomName);
    $remove(this.chatRoot);
    $remove(this.detailsRoot);
  }

  prependCluster(cluster) {
    this.entries.prepend(cluster.dom.container);
  }
  apppendCluster(cluster) {
    this.entries.appendChild(cluster.dom.container);
  }

  scrollDown() {
    this.entries.scrollTop = this.entries.scrollHeight;
  }

  createDom() {
    this.createRoomChat($id('RoomChat'));
    this.createRoomDetails($id('RoomDetails'));
    this.roomName = $create('div');
    this.roomName.classList.add('ChatName');
    this.roomName.innerText = this.room.name;
    this.roomName.hidden = true;
    $id('RoomHeader').prepend(this.roomName);
    // prepend to make sure it's before the div.clear
  }
  createRoomChat(parent) {
    this.chatRoot = $create('div');
    this.chatRoot.classList.add('ChatRoot');
    this.chatRoot.hidden = true;
    parent.appendChild(this.chatRoot);

    this.entries = $create('div');
    this.entries.classList.add('EntriesContainer');
    this.chatRoot.appendChild(this.entries);

    this.bottomBar = $create('div');
    this.bottomBar.classList.add('BottomBar');
    this.chatRoot.appendChild(this.bottomBar);

    this.input = $create('input');
    $on(this.chatRoot, 'focus', ()=>{this.input.focus();});
    this.input.classList.add('ChatInput');
    this.input.type = 'text';
    this.bottomBar.appendChild(this.input);
    let keyboard = new Keyboard(this.input);
    keyboard.bind('Enter', () => {
      this.room.sendTextEntry();
      this.input.value = '';
    });

    this.send = $create('button');
    this.send.classList.add('ChatSend');
    this.send.innerText = 'Send';
    this.bottomBar.appendChild(this.send);
    this.send.onclick = () => {
      this.room.sendTextEntry();
      this.input.value = '';
    }
  }
  createRoomDetails(parent) {
    this.detailsRoot = $create('div');
    this.detailsRoot.classList.add('DetailsRoot');
    this.detailsRoot.hidden = true;
    parent.appendChild(this.detailsRoot);

    this.detailsRoot.innerText = `Details of room ${this.room.name}`;
  }
}
