
class Entry {
  constructor(userID, timestamp, reactions) {
    this.userID = userID;
    this.timestamp = timestamp;
    this.reactions = reactions;
    this.dom = {};
  }
  createDom() {
    this.dom.container = $create('div');
    this.dom.container.classList.add('Entry');

    this.dom.inner = $create('span');
    this.dom.inner.classList.add('Inner');
    this.dom.container.appendChild(this.dom.inner);

    this.dom.reactions = $create('div');
    this.dom.reactions.classList.add('Reactions');
    this.dom.container.appendChild(this.dom.reactions);
  }
}

class TextEntry extends Entry {
  constructor(data) {
    super(data.userID, data.timestamp, data.reactions);
    this.content = data.content;
    this.createDom();
  }
  createDom() {
    super.createDom();
    this.dom.inner.innerText = this.content;
  }
}

class ImageEntry extends Entry {
  constructor(data) {
    super(data.userID, data.timestamp, data.reactions);
    this.source = data.source;
    this.createDom();
  }
  createDom() {
    super.createDom();
    this.dom.img = $create('img');
    this.dom.img.src = this.content;
    this.dom.inner.appendChild(this.dom.img);
  }
}

class EntryAutoType {
  constructor(entry) {
    return new {
      'text': TextEntry,
      'image': ImageEntry,
    }[entry.etype](entry);
  }
}
