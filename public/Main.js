var $SOCKET = io.connect(window.location.href);
var $VERSION, $RELEASE;
var $USER, $APP;
var $DOM_SECTIONS;

function onload() {
  $APP = new Application();
  // Restore session from cookies
  cookieLogin()
  // Handle DOM sections
  $DOM_SECTIONS = {
    login: new DomSection('SectionLogin', new Permissions(user=false)),
    home: new DomSection('SectionHome', new Permissions(user=true), header=true),
    account: new DomSection('SectionAccount', new Permissions(user=true), header=true),
    about: new DomSection('SectionAbout', new Permissions())
  };
  // Event listeners
  $id('LoginUsername').addEventListener('keydown', function(evt) {
    if (evt.key == 'Enter') loginOnclick(); });
  $id('LoginPassword').addEventListener('keydown', function(evt) {
    if (evt.key == 'Enter') loginOnclick(); });
}

function cookieLogin() {
  var username = getCookie('Username');
  var sessionID = getCookie('SessionID');
  API_CookieLogin(username, sessionID);
}
