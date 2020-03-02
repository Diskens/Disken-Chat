
// CookieLogin
function API_CookieLogin(username, sessionID) {
  const data = {username, sessionID};
  console.log('Sending "CookieLogin"', data);
  $SOCKET.emit('CookieLogin', data);
}
function Re_CookieLogin(data) {
  console.log('Received "Re_CookieLogin"', data);
  if (data.success) {
    $LOGGEDIN = true;
    $PLAYER = data.player;
    setCookie('Username', $PLAYER.username);
    setCookie('SessionID', $SOCKET.id);
    $id('Welcome').innerText = `Welcome ${$PLAYER.username}!`;
    if ($PLAYER.inGame) API_RestoreGame($PLAYER.username, $SOCKET.id);
  }
  autoSwitchHeader();
  autoSwitchPlayButton();
}
$SOCKET.on('Re_CookieLogin', Re_CookieLogin);


// Login
function API_Login(username, password) {
  const data = {username, password};
  console.log('Sending "Login"', data);
  $SOCKET.emit('Login', data);
}
function Re_Login(data) {
  console.log('Received "Re_Login"', data);
  if (data.success) popupMessage('Successfully logged in');
  else {popupError(`Could not log in:\n${data.reason}`); return; }
  $LOGGEDIN = true;
  $PLAYER = data.player;
  setCookie('Username', $PLAYER.username);
  setCookie('SessionID', $SOCKET.id);
  $id('Welcome').innerText = `Welcome ${$PLAYER.username}!`;
  autoSwitchHeader();
  autoSwitchPlayButton();
}
$SOCKET.on('Re_Login', Re_Login);


// Signup
function API_Signup(username, password) {
  const data = {username, password};
  console.log('Sending "Signup"', data);
  $SOCKET.emit('Signup', data);
}
function Re_Signup(data) {
  console.log('Received "Re_Signup"', data);
  if (data.success) popupMessage('Successfully registered');
  else popupError(`Could not register:\n${data.reason}`);
}
$SOCKET.on('Re_Signup', Re_Signup);


// Logout
function API_Logout(username, password) {
  const data = {username};
  if ($PLAYER.inGame) {
    $GAME.chat.clearHistory();
    $GAME.slotsDom.removeAll();
  }
  $LOGGEDIN = false;
  $PLAYER = undefined;
  console.log('Sending "Logout"', data);
  $SOCKET.emit('Logout', data);
  $id('Welcome').innerText = '';
  popupMessage('Logged out');
  switchSection('home');
  autoSwitchHeader();
  autoSwitchPlayButton();
  setCookie('Username', '');
  setCookie('SessionID', '');
}
