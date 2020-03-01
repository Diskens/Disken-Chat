const PORT = 80;

var app, meta, common={}, current={};
var games = {}; // active games

// Utilities
const Application = require('./server/utils/Application.js').Application;
const MetaHolder = require('./server/utils/MetaHolder.js').MetaHolder;

const AccountsApi = require('./server/accounts/API.js').AccountsApi;
const AccountsHolder = require('./server/accounts/Holder.js').AccountsHolder;

const GamesApi = require('./server/games/API.js').GamesApi;
const GamesHolder = require('./server/games/Holder.js').GamesHolder;

async function main() {
  app = new Application(PORT, './public');
  meta = new MetaHolder('./current/meta.json');
  console.log(`[Main] Starting (v${meta.getVersion()} ${meta.getRelease()})`);
  meta._set('onlineCount', 0);

  current.activeClients = {};
  current.accounts = new AccountsHolder();
  await current.accounts.flagEveryoneOffline();
  current.games = new GamesHolder();

  const data = {meta, common, current};
  const apis = [ new AccountsApi(data), new GamesApi(data) ];
  for (var api of apis) app.addApi(api);
  app.begin();
}

main();
