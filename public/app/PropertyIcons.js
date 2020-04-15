
const PropertyIcons = {
  createPublicIcon: () => {
    var icon = $create('p');
    icon.classList.add('property');
    icon.style['background-image'] = "url('../images/public.png')";
    icon.title = 'This room is public. Anyone can join';
    return icon;
  },
  createClosedIcon: () => {
    var icon = $create('p');
    icon.classList.add('property');
    icon.style['background-image'] = "url('../images/private.png')";
    icon.title = 'This room is closed. Only invited users can join';
    return icon;
  },
  createHistoryIcon: () => {
    var icon = $create('p');
    icon.classList.add('property');
    icon.style['background-image'] = "url('../images/history.png')";
    icon.title = 'This room\'s chat is saved. You can review it any time';
    return icon;
  },
  createNoHistoryIcon: () => {
    var icon = $create('p');
    icon.classList.add('property');
    icon.style['background-image'] = "url('../images/nohistory.png')";
    icon.title = 'This room\'s chat is not saved. Once everyone leaves it is forever forgotten';
    return icon;
  },
  createOwnedIcon: () => {
    var icon = $create('p');
    icon.classList.add('property');
    icon.style['background-image'] = "url('../images/owned.png')";
    icon.title = 'You are the owner of this room';
    return icon;
  },
  createNotOwnedIcon: () => {
    var icon = $create('p');
    icon.classList.add('property');
    icon.style['background-image'] = "url('../images/notowned.png')";
    icon.title = 'You are not the owner of this room';
    return icon;
  },
  createOwnerUserIcon: () => {
    var icon = $create('p');
    icon.classList.add('property');
    icon.style['background-image'] = "url('../images/owned.png')";
    icon.title = 'This is the owner of this room';
    return icon;
  }
};
