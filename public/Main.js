const $VERSION = '0.1.0';
const $RELEASE = 'alpha';
var $SOCKET = io.connect(window.location.href);
var $LOGGEDIN = false; // is-logged-in flag
var $SECTION; // currently displayed section name
var $PLAYER; // player account dataa
var $GAME;

var domSections;

function onload() {
  $id('Version').innerText =  `v${$VERSION} ${$RELEASE}`;
  loginWithCookie() // Restore account session from cookies
  // Handle DOM sections and headers
  domSections = {
    home: new DomSection('SectionHome', new Permissions(0, 1)),
    about: new DomSection('SectionAbout', new Permissions(0, 0)),
    account: new DomSection('SectionAccount', new Permissions(1, 0), onSwitchAccount),
    lobbiesList: new DomSection('SectionListing', new Permissions(1, 0), onShowLobbies),
    lobby: new DomSection('SectionLobby', new Permissions(1, 2), onLobbyJoin),
    admin: new DomSection('SectionAdmin', new Permissions(2, 0))
  };
  $SECTION = getCookie('Section');
  if ($SECTION == undefined) $SECTION = 'home';
  switchSection($SECTION);
  // Login when Enter pressed in input fields
  $id('Username').addEventListener('keydown', function(evt) {
    if (evt.key == 'Enter') loginOnclick(); });
  $id('Password').addEventListener('keydown', function(evt) {
    if (evt.key == 'Enter') loginOnclick(); });
}

function loginWithCookie() {
  var username = getCookie('Username');
  var sessionID = getCookie('SessionID');
  if (username == undefined || sessionID == undefined) {
    autoSwitchHeader();
    return;
  }
  API_CookieLogin(username, sessionID);
}