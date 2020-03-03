
// Onclicks
function loginOnclick() {
  API_Login($id('Username').value, $id('Password').value);
}
function signupOnclick() {
  API_Signup($id('Username').value, $id('Password').value);
}
function logoutOnclick() {
  API_Logout($USER.username);
}

// Sections
function onSwitchAccount() {
  const holder = $id('AccountDataHolder');
  removeChildren(holder);

  var elm = document.createElement('h3');
  elm.innerText = $USER.username;
  holder.appendChild(elm);

  var elm = document.createElement('p');
  var date = new Date(0);
  date.setSeconds($USER.accountCreated/1000);
  elm.innerText = `Joined: ${date.toLocaleDateString('en-UK')}`;
  holder.appendChild(elm);
}

// Account color
function confirmColorChange(picker) {
  var color = $id('ColorInput').style['background-color'];
  API_ChangeUserColor($USER.username, color);
}
