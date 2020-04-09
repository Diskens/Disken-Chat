function $id(id) {
  return document.getElementById(id);
}
function $cn(cn) {
  return document.getElementsByClassName(cn);
}
function $create(tag) {
  return document.createElement(tag);
}

function removeChildren(container) {
  var children = Array.from(container.childNodes);
  for (var child of children) child.parentNode.removeChild(child);
}
