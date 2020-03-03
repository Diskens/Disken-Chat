
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
    $USER = data.user;
    setCookie('Username', $USER.username);
    setCookie('SessionID', $SOCKET.id);
    $id('Welcome').innerText = `Welcome ${$USER.username}!`;
    if ($USER.inRoom) API_RestoreRoom($USER.username, $SOCKET.id);
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
  $USER = data.user;
  setCookie('Username', $USER.username);
  setCookie('SessionID', $SOCKET.id);
  $id('Welcome').innerText = `Welcome ${$USER.username}!`;
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
  if ($USER.inRoom) {
    $ROOM.chat.clearHistory();
    $ROOM.slotsDom.removeAll();
  }
  $LOGGEDIN = false;
  $USER = undefined;
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


// Is-writing status
function API_SetIsTyping(status) {
  console.log('Sending "SetIsTyping"');
  $SOCKET.emit('SetIsTyping', {username:$USER.username, status, sessionID:$SOCKET.id})
}
function Re_SetIsTyping(data) {
  console.log('Received "Re_SetIsTyping"', data);
  $ROOM.chat.setIsTyping(data.username, data.status);
}
$SOCKET.on('Re_SetIsTyping', Re_SetIsTyping);


// Set account color
function API_ChangeUserColor(username, color) {
  const data = {username, color, sessionID:$SOCKET.id};
  console.log('Sending "ChangeUserColor"', data);
  $SOCKET.emit('ChangeUserColor', data);
}
function Re_ChangeUserColor(data) {
  console.log('Received "Re_ChangeUserColor"', data);
  popupMessage('Color changed');
  Re_GetUserColor({username:$USER.username, color:data.color});
}
$SOCKET.on('Re_ChangeUserColor', Re_ChangeUserColor);


// Get account color
function API_GetUserColor(username) {
  $SOCKET.emit('GetUserColor', {username});
}
function Re_GetUserColor(data) {
  var oldStyle = $id(`style_user_${data.username}`);
  if (oldStyle != undefined) oldStyle.parentNode.removeChild(oldStyle);
  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `.user_${data.username} {background: ${data.color};}`;
  style.id = `style_user_${data.username}`;
  document.getElementsByTagName('head')[0].appendChild(style);
}
$SOCKET.on('Re_GetUserColor', Re_GetUserColor);
