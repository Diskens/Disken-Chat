// Onclicks
function onCreateGame() {
  API_CreateGame($id('newGameMaxPlayers').value, $id('newGameMapID').value);
}
function onJoinLobby(ID) {
  API_JoinLobby($PLAYER.username, ID);
}
function onLeaveLobby() {
  API_LeaveLobby($PLAYER.username, $GAME.ID);
}

// Section lobby
function onLobbyJoin() {
  $GAME.attachLobbyContent();
}

// Section lobbies list
function onShowLobbies() {
  API_GetAvailableGames()
}
function showLobbies(games) { // Called by the response
  const holder = $id('LobbiesListHolder');
  removeChildren(holder);
  for (var game of games) {
    var startedAgo = getTimeDiffText(Date.now(), game.startTime);
    holder.innerHTML += `
      <div class='game'>
        <div class='left'>
          <table>
          <tr> <td> Players </td><td> ${game.players.length} of ${game.maxPlayers} </td> </tr>
          <tr> <td> Map ID </td><td> ${game.mapID} </td> </tr>
          <tr> <td> Created </td><td> ${startedAgo} </td> </tr>
          </table>
        </div>
        <div class='right'>
          ${game.ID}
        </div>
        <div class='clear'> </div>
        <p><a class="button" onclick="onJoinLobby(${game.ID})"> Join </a></p>
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
