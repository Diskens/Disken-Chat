$POPUP_ID = 0;
$POPUP_COUNT = 0;

function popup(message) {
  var id = $POPUP_ID;
  $POPUP_ID += 1;

  var container = document.createElement('div');
  container.id = `popup_${id}`;
  container.classList.add('popup');

  var text = document.createElement('p');
  text.innerText = message;
  container.appendChild(text);

  var close = document.createElement('div');
  close.classList.add('popupClose');
  close.innerText = 'X'
  close.onclick = function() {closePopup(id);};
  container.appendChild(close);

  $id('PopupsContainer').appendChild(container);
  $POPUP_COUNT += 1;
  setTimeout(closePopup, 2250, id);
}

function closePopup(id) {
  $POPUP_COUNT -= 1;
  var popup = $id(`popup_${id}`);
  try { popup.parentNode.removeChild(popup); }
  catch (err) { return; }
}
