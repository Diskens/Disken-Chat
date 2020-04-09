
function loginOnclick() {
  API_CredsLogin($id('LoginUsername').value, $id('LoginPassword').value, $SOCKET.id);
}

function signupOnclick() {
  API_Signup($id('LoginUsername').value, $id('LoginPassword').value, $SOCKET.id);
}

function logoutOnclick() {
  API_Logout($USER.username, $SOCKET.id);
}
