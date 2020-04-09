const $PORT = 205;
const LOG_FN_TEMPLATE = 'logs/serverLogs_$DATE.txt';

var $LOG, $APP;
var $DATA={};

const Log = require('./server/utilities/Logger.js').Logger;

const Application = require('./server/utilities/Application.js').Application;
const Meta = require('./server/utilities/Meta.js').Meta;

const AccountsApi = require('./server/AccountsAPI.js').AccountsApi;
const AccountsData = require('./server/AccountsData.js').AccountsData;
const RoomsApi = require('./server/RoomsAPI.js').RoomsApi;
const RoomsData = require('./server/RoomsData.js').RoomsData;
const HistoryData = require('./server/HistoryData.js').HistoryData;

async function main() {
  $DATA.meta = new Meta('./data/meta.json');
  $DATA.meta.reset();
  $LOG = new Log(LOG_FN_TEMPLATE, $DATA.meta.getTzOffset());
  $APP = new Application($LOG, $PORT, './public');

  $LOG.newSession($DATA.meta);

  $DATA.accounts = new AccountsData($LOG, $DATA.meta);
  await $DATA.accounts.reset();
  $DATA.rooms = new RoomsData($LOG, $DATA.meta);
  await $DATA.rooms.reset();
  $DATA.history = new HistoryData($LOG, $DATA.meta);

  $APP.addAPI(new AccountsApi($LOG, $DATA));
  $APP.addAPI(new RoomsApi($LOG, $DATA));

  $APP.begin();
}

main();
