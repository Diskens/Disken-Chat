
function popupMessage(text) {
  var popup = document.createElement('div');
  popup.classList.add('popup');
  popup.classList.add('info');
  popup.innerText = `${text}`;
  document.body.appendChild(popup);
  popup.onclick = function(){popup.parentNode.removeChild(popup);};
}

function popupError(text) {
  var popup = document.createElement('div');
  popup.classList.add('popup');
  popup.classList.add('error');
  popup.innerText = `${text}`;
  document.body.appendChild(popup);
  popup.onclick = function(){popup.parentNode.removeChild(popup);};
}
