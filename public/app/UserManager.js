
class UserManager {
  constructor(socket) {
    this.loggedIn = false;
    this.user = {};
    SOCKET.on('Login', (data)=>{this.onLogin(data)});
    SOCKET.on('Logout', (data)=>{this.onLogout(data)});
    SOCKET.on('Signup', (data)=>{this.onSignup(data)});
  }

  get() {
    if (this.loggedIn) return this.user;
  }

  /* SOCKETIO INTERFACE */

  credsLogin() {
    let username = $id('LoginUsername').value;
    let password = $id('LoginPassword').value;
    let sessionID = SOCKET.id;
    console.log(sessionID);
    SOCKET.emit('CredsLogin', {username, password, sessionID});
  }
  cookieLogin() {
    let username = Cookie.get('Username');
    let sessionID = Cookie.get('SessionID');
    let newSession = SOCKET.id;
    console.log('Cookie login', sessionID, newSession);
    SOCKET.emit('CookieLogin', {username, sessionID, newSession});
  }
  onLogin(data) {
    console.log('onLogin', data);
    if (!data.success) {
      if (!data.cookies) Popup.create(`Could not log in (${data.reason})`);
      return;
    }
    Cookie.set('Username', data.user.username);
    Cookie.set('SessionID', SOCKET.id);
    Popup.create(`Logged in. Welcome ${data.user.username}!`);
    swMain.goto('room');
    this.user = data.user;
    this.loggedIn = true;
  }

  logout() {
    if (!this.loggedIn) return;
    let username = this.user.username;
    let sessionID = SOCKET.id;
    console.log(sessionID);
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
  }
  onSignup(data) {
    if (!data.success) {
      Popup.create(`Could not sign up (${data.reason})`);
      return;
    }
  }

}
