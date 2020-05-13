
// Keep socket connection aline
function API_Ping() {
  $SOCKET.emit('Ping');
}

// Credentials Login
function API_CredsLogin(username, password, sessionID) {
  $SOCKET.emit('CredsLogin', {username, password, sessionID});
}
function On_CredsLogin(data) {
  console.log('CredsLogin', data);
  if (data.success) {
    $USER = data.user;
    setCookie('Username', $USER.username);
    setCookie('SessionID', $SOCKET.id);
    switchTo('home');
    popup('Logged in');
    $id('Username').innerText = $USER.username;
    $APP.begin();
  } else
    popup(`Could not log in (${data.reason})`);
}
$SOCKET.on('CredsLogin', On_CredsLogin);


// Cookie Login
function API_CookieLogin(username, sessionID) {
  $SOCKET.emit('CookieLogin', {username, sessionID});
}
function On_CookieLogin(data) {
  if (data.success) {
    $USER = data.user;
    setCookie('Username', $USER.username);
    setCookie('SessionID', $SOCKET.id);
    switchTo('home');
    popup('Logged in (cookies)');
    $id('Username').innerText = $USER.username;
    $APP.begin();
  }
  else switchTo('login');
  console.log('CookieLogin', data);
}
$SOCKET.on('CookieLogin', On_CookieLogin);


// Connection
function On_Connect(data) {
  var text = `v${data.version} ${data.release}`;
  $id('VersionLogin').innerText = text;
  $id('VersionAbout').innerText = text;
}
$SOCKET.on('Connect', On_Connect);


// Logout
function API_Logout(username) {
  $SOCKET.emit('Logout', {username});
  if ($APP.room) $APP.room.hide();
}
function On_Logout(data) {
  $USER = undefined;
  switchTo('login');
  popup('Logged out');
  console.log('Logout', data);
}
$SOCKET.on('Logout', On_Logout);


// Signup
function API_Signup(username, password) {
  $SOCKET.emit('Signup', {username, password});
}
function On_Signup(data) {
  if (data.success) popup('Account created successfully');
  else popup(`Could not create account: ${data.reason}`);
}
$SOCKET.on('Signup', On_Signup);
