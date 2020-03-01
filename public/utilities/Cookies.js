
function setCookie(name, value, hours=2) {
  var d = new Date();
  d.setTime(d.getTime() + (hours*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
  var cookies = document.cookie.split('; ');
  var retrieved = {};
  cookies.map(function(x){
    var data = x.split('=');
    retrieved[data[0]] = data[1];
  })
  var result = retrieved[name];
  if (result == '') return undefined;
  return result;
}
