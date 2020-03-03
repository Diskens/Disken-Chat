const PORT = 80;

var app, meta, common={}, current={};
var rooms = {}; // active rooms

// Utilities
const Application = require('./server/utils/Application.js').Application;
const MetaHolder = require('./server/utils/MetaHolder.js').MetaHolder;

const AccountsApi = require('./server/accounts/API.js').AccountsApi;
const AccountsHolder = require('./server/accounts/Holder.js').AccountsHolder;

const RoomsApi = require('./server/rooms/API.js').RoomsApi;
const RoomsHolder = require('./server/rooms/Holder.js').RoomsHolder;

async function main() {
  app = new Application(PORT, './public');
  meta = new MetaHolder('./current/meta.json');
  console.log(`[Main] Starting (v${meta.getVersion()} ${meta.getRelease()})`);
  meta._set('onlineCount', 0);

  current.activeClients = {};
  current.accounts = new AccountsHolder();
  await current.accounts.flagEveryoneOffline();
  current.rooms = new RoomsHolder();

  const data = {meta, common, current};
  const apis = [ new AccountsApi(data), new RoomsApi(data) ];
  for (var api of apis) app.addApi(api);
  app.begin();
}

main();
