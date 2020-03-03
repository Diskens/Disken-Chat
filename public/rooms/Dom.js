// Onclicks
function onCreateRoom() {
  API_CreateRoom($id('newRoomMaxUsers').value);
}
function onJoinRoom(ID) {
  API_JoinRoom($USER.username, ID);
}
function onLeaveRoom() {
  API_LeaveRoom($USER.username, $ROOM.ID);
}


// Section rooms list
function onShowRooms() {
  API_GetAvailableRooms()
}
function showRooms(rooms) { // Called by the response
  const holder = $id('RoomsListHolder');
  removeChildren(holder);
  for (var room of rooms) {
    var startedAgo = getTimeDiffText(Date.now(), room.startTime);
    holder.innerHTML += `
      <div class='room'>
        <div class='left'>
          <table>
          <tr> <td> Users </td><td> ${room.users.length} of ${room.maxUsers} </td> </tr>
          <tr> <td> Created </td><td> ${startedAgo} </td> </tr>
          </table>
        </div>
        <div class='right'>
          ${room.ID}
        </div>
        <div class='clear'> </div>
        <p><a class="button" onclick="onJoinRoom(${room.ID})"> Join </a></p>
      </div>
`;
  }
}
function getTimeDiffText(a, b) {
  var seconds = (a - b) / 1e3;
  if (seconds < 60) return `less than minute ago`;
  var minutes = Math.floor(seconds / 60);
  if (minutes == 1) return `1 minute ago`;
  if (minutes < 60) return `${minutes} minutes ago`;
  var hours = Math.floor(minutes / 60);
  if (hours == 1) return `an hour ago`;
  if (hours < 24) return `${hours} hours ago`;
  var days = Math.floor(hours / 24);
  if (days == 1) return `yesterday`;
  if (days < 7) return `${days} days ago`;
  var weeks = Math.floor(days / 7);
  if (weeks == 1) return `a week ago`;
  return `${weeks} weeks ago`;
}
