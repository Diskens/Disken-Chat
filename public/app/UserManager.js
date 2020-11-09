
class UserManager {
  constructor() {
    this.loggedIn = false;
    this.user = {};
    SOCKET.on('Login', (data)=>{this.onLogin(data)});
    SOCKET.on('Logout', (data)=>{this.onLogout(data)});
    SOCKET.on('Signup', (data)=>{this.onSignup(data)});
  }

  get() {
    if (this.loggedIn) return this.user;
    else console.log('Not logged in', this);
  }

  /* SOCKETIO INTERFACE */

  credsLogin() {
    let username = $id('LoginUsername').value;
    let password = $id('LoginPassword').value;
    let sessionID = SOCKET.id;
    SOCKET.emit('CredsLogin', {username, password, sessionID});
    $id('LoginPassword').value = '';
  }
  cookieLogin() {
    let username = Cookie.get('Username');
    let sessionID = Cookie.get('SessionID');
    let newSession = SOCKET.id;
    SOCKET.emit('CookieLogin', {username, sessionID, newSession});
  }
  onLogin(data) {
    if (!data.success) {
      if (!data.cookies) Popup.create(`Could not log in (${data.reason})`);
      swMain.goto('landing');
      return;
    }
    Cookie.set('Username', data.user.username);
    Cookie.set('SessionID', SOCKET.id);
    Popup.create(`Logged in. Welcome ${data.user.username}!`);
    swMain.goto('room');
    this.user = data.user;
    this.loggedIn = true;
    ROOMS.getUserRooms();
  }

  logout() {
    if (!this.loggedIn) return;
    let username = this.user.username;
    let sessionID = SOCKET.id;
    SOCKET.emit('Logout', {username, sessionID});
  }
  onLogout(data) {
    if (!data.success) {
      Popup.create(`Could not log out. ${data.reason}`);
      return;
    }
    this.user = {};
    this.loggedIn = false;
    swMain.goto('landing');
    Popup.create(`Logged out`);
  }

  signup() {
    let username = $id('SignupUsername').value;
    let email = $id('SignupEmail').value;
    let password = $id('SignupPassword').value;
    let sessionID = SOCKET.id;
    SOCKET.emit('Signup', {username, email, password, sessionID});
    $id('SignupPassword').value = '';
  }
  onSignup(data) {
    if (!data.success) {
      Popup.create(`Could not sign up (${data.reason})`);
      return;
    }
    Popup.create(`Signed up. Please log in to continue.`);
    $id('SignupUsername').value = '';
    $id('SignupEmail').value = '';
  }

}
