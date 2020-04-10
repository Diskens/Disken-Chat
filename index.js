const $PORT = 80;
const LOG_FN_TEMPLATE = 'logs/serverLogs_$DATE.txt';

const Log = require('./server/utilities/Logger.js').Logger;

const {Application} = require('./server/utilities/Application.js');
const {Meta} = require('./server/utilities/Meta.js');

const {AccountsApi} = require('./server/AccountsAPI.js');
const {AccountsData} = require('./server/AccountsData.js');
const {RoomsApi} = require('./server/RoomsAPI.js');
const {RoomsData} = require('./server/RoomsData.js');
const {StatusApi} = require('./server/StatusApi.js');
const {HistoryData} = require('./server/HistoryData.js');

async function main() {
  global.$DATA = {};
  global.$DATA.meta = new Meta('./data/meta.json');
  global.$DATA.meta.reset();
  global.$LOG = new Log(LOG_FN_TEMPLATE, global.$DATA.meta.getTzOffset());
  global.$APP = new Application($PORT, './public');

  global.$LOG.newSession(global.$DATA.meta);

  $DATA.accounts = new AccountsData();
  await $DATA.accounts.reset();
  $DATA.rooms = new RoomsData();
  await $DATA.rooms.reset();
  $DATA.history = new HistoryData();

  global.$APP.addAPI('accounts', new AccountsApi());
  global.$APP.addAPI('rooms', new RoomsApi());
  global.$APP.addAPI('status', new StatusApi());

  global.$APP.begin();
}

main();
