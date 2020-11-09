
class EntriesManager {
  constructor(room) {
    this.room = room;
    this.clusters = [];
  }
  getUsername(userID) {
    return this.room.members.getUsername(userID);
  }
  prependMany(entries) {
    entries = entries.reverse();
    for (let entry of entries) this.prepend(entry);
  }
  prepend(entry) {
    entry = new EntryAutoType(entry);
    let cluster = this.clusters[0];
    if (cluster == undefined || cluster.userID != entry.userID) {
      cluster = new EntriesCluster(this, entry.userID);
      cluster.prepend(entry);
      this.room.dom.prependCluster(cluster);
      this.clusters.unshift(cluster);
    } else {
      cluster.prepend(entry);
    }
  }
  appendMany(entries) {
    for (let entry of entries) this.append(entry);
  }
  append(entry) {
    entry = new EntryAutoType(entry);
    let cluster = this.clusters[this.clusters.length-1];
    if (cluster == undefined || cluster.userID != entry.userID) {
      cluster = new EntriesCluster(this, entry.userID);
      cluster.append(entry);
      this.room.dom.apppendCluster(cluster);
      this.clusters.push(cluster);
    } else {
      cluster.append(entry);
    }
    this.room.dom.scrollDown();
  }
}


class EntriesCluster {
  constructor(manager, userID) {
    this.manager = manager;
    this.userID = userID;
    this.entries = [];
    this.createDom();
  }
  prepend(entry) {
    this.entries.unshift(entry);
    this.dom.container.insertBefore(entry.dom.container,
      this.dom.container.children[0]);
  }
  append(entry) {
    this.entries.push(entry);
    this.dom.container.insertBefore(entry.dom.container,
      this.dom.username);
  }
  createDom() {
    this.dom = {};
    this.dom.container = $create('div');
    this.dom.container.classList.add('Cluster');
    if (this.userID == USER.get().ID) {
      this.dom.container.classList.add('Own');
    } else {
      this.dom.username = $create('span');
      this.dom.username.classList.add('Username');
      this.dom.username.innerText = this.manager.getUsername(this.userID);
      this.dom.container.appendChild(this.dom.username);
    }
  }
}
