
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
  updatePasscode(passcode) {
    this.passcode.innerText = passcode;
  }

  createDom() {
    let compiler = new ShpCompiler();
    this.createRoomChat(compiler, $id('RoomChat'));
    this.createRoomDetails(compiler, $id('RoomDetails'));
    this.roomName = compiler.compile(`$div[.ChatName !hidden] {
      ${this.room.name}}`)[0];
    $id('RoomHeader').prepend(this.roomName);
  }


  createRoomChat(compiler, parent) {
    let sendTextEntry = () => {
      this.room.sendTextEntry();
      this.input.value = '';
    }
    this.chatRoot = compiler.compile(`
      $div[.ChatRoot !hidden] {
        $div[.EntriesContainer]
        $div[.BottomBar] {
          $input[.ChatInput type text]
          $button[.ChatSend] {Send}
        }
      }
    `)[0];
    parent.appendChild(this.chatRoot);
    this.entries = this.chatRoot.querySelector('.EntriesContainer');
    this.input = this.chatRoot.querySelector('.ChatInput');
    $on(this.chatRoot, 'click', () => {
      if (!window.getSelection().toString()) this.input.focus();
    });
    let keyboard = new Keyboard(this.input);
    keyboard.bind('Enter', sendTextEntry);
    let sendText = this.chatRoot.querySelector('.ChatSend');
    $on(sendText, 'click', sendTextEntry);
  }
  createRoomDetails(compiler, parent) {
    let passcodeShp = (this.room.passcode == undefined) ? `
    $div[.Pair] {
      $div[.Key] {Passcode}
      $div[.Value] {You can not view the passcode}
      $div[.Clear]
    }
    ` : `
      $div[.Pair] {
        $div[.Key] {Passcode}
        $div[.Value .Passcode] {${this.room.passcode}}
        $div[.Clear]
      }
      $div[.Right] {
        $button[.CopyPasscode] {Copy}
        $button[.ResetPasscode] {Reset}
      }
      $div[.Clear]
      `;
    this.detailsRoot = compiler.compile(`
      $div[.DetailsRoot !hidden] {
        $div[.Pair] { $div[.Key] {Name}
          $div[.Value] {${this.room.name}}
          $div[.Clear]
        }
        ${passcodeShp}
      }
    `)[0];
    parent.appendChild(this.detailsRoot);
    this.passcode = this.detailsRoot.querySelector('.Passcode');
    if (this.room.passcode != undefined) {
      let copy = this.detailsRoot.querySelector('.CopyPasscode');
      $on(copy, 'click', () => {
        Clipboard.copy(this.room.passcode);
        Popup.create('Copied passcode to the clipboard');
      });
      let reset = this.detailsRoot.querySelector('.ResetPasscode');
      $on(reset, 'click', ()=>{this.room.manager.resetPasscode(this.room.ID);});
    }
  }
}
