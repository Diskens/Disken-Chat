
function domCreateRoom() {
  var name = $id('CreateName').value;
  var isPublic = $id('CreatePublic').checked;
  var history = $id('CreateHistory').checked;
  API_CreateRoom($USER.username, name, isPublic, history);
}

function domJoinRoom() {
  var name = $id('JoinName').value;
  var passcode = $id('JoinPasscode').value;
  API_JoinRoom($USER.username, name, passcode);
}
