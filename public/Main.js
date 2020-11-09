let SOCKET, USER, ROOMS;
let userMenu, anonMenu; // Domi.js toggles
let swMain, swRoom, swBrowse; // Domi.js switches

let onDomLoaded = () => {
  SOCKET = io.connect(window.location.href);
  SOCKET.on('Initialize', (data) => {
    console.log('Initialized');
    for (let elm of $cn('Version'))
      elm.innerText = `v${data.version} ${data.release}`;
    ROOMS = new RoomsManager();
    USER = new UserManager();
    USER.cookieLogin();
    setupDomi();
  });
}

let setupDomi = () => {
  let toggles = {
    home: 'BtnHome', about: 'BtnAbout', account: 'BtnAccount', // swMain
    room: 'BtnRoom', browse: 'BtnBrowse', create: 'BtnCreate',
    chat: 'BtnChat', details: 'BtnDetails', list: 'BtnList', // swRoom
    public: 'BtnPublic', join: 'BtnJoin', // swBrowse
  };
  for (let [key, id] of Object.entries(toggles)) {
    toggles[key] = new DomStateToggle($id(id), false, {trueClass:'active'})
  }

  anonMenu = new DomStateToggle($id('AnonHeader'), false, {hide:true});
  userMenu = new DomStateToggle($id('UserHeader'), false, {hide:true});
  roomMenu = new DomStateToggle($id('RoomHeader'), false, {hide:true});
  banner = new DomStateToggle($id('Banner'), false, {hide:true});

  swMain = new Switcher();
  swMain.addToggle('anon', anonMenu);
  swMain.addToggle('user', userMenu);
  swMain.addSection(new Section('landing', $id('SectionLanding'),
    [anonMenu, banner, toggles.home]));
  swMain.addSection(new Section('about', $id('SectionAbout'),
    [anonMenu, banner, toggles.about]));
  swMain.addSection(new Section('account', $id('SectionAccount'),
    [userMenu, toggles.account]));
  swMain.addSection(new Section('room', $id('SectionRoom'),
    [userMenu, toggles.room]));
  swMain.addSection(new Section('browse', $id('SectionBrowse'),
    [userMenu, toggles.browse]));
  swMain.addSection(new Section('create', $id('SectionCreate'),
    [userMenu, toggles.create]));
  swMain.goto('landing');

  swRoom = new Switcher();
  swRoom.addSection(new Section('chat', $id('RoomChat'),
    [roomMenu, toggles.chat]));
  swRoom.addSection(new Section('details', $id('RoomDetails'),
    [roomMenu, toggles.details]));
  swRoom.addSection(new Section('list', $id('RoomList'),
    [toggles.list]));
  swRoom.goto('list');

  swBrowse = new Switcher();
  swBrowse.addSection(new Section('browse', $id('BrowsePublic'),
    [toggles.public]));
  swBrowse.addSection(new Section('join', $id('BrowseJoin'),
    [toggles.join]));
  swBrowse.goto('browse');
}
