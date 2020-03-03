var popupCounter = 0;
var $POPUPS = {};

function _popup(type, text) {
  var popup = document.createElement('div');
  popup.classList.add('popup');
  popup.classList.add(type);
  popup.innerText = `${text}`;
  document.body.appendChild(popup);
  popup.onclick = function(){popup.parentNode.removeChild(popup);};
  var id  = popupCounter;
  popupCounter += 1;
  $POPUPS[id] = popup;
  setTimeout(function(id) {
    var popup = $POPUPS[id];
    delete $POPUPS[id];
    try {popup.parentNode.removeChild(popup);}
    catch (err) {}
  }, 2000, id);
}

function popupMessage(text) { _popup('info', text); }
function popupError(text) {_popup('error', text); }
