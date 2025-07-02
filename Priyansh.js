const moment = require("moment-timezone");
const { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } = require("fs-extra");
const { join, resolve } = require("path");
const { execSync } = require('child_process');
const logger = require("./utils/log.js");
const login = require("fca-smart-shankar");
const axios = require("axios");
const listPackage = JSON.parse(readFileSync('./package.json')).dependencies;
const listbuiltinModules = require("module").builtinModules;

global.client = {
  commands: new Map(),
  events: new Map(),
  cooldowns: new Map(),
  eventRegistered: [],
  handleSchedule: [],
  handleReaction: [],
  handleReply: [],
  mainPath: process.cwd(),
  configPath: "",
  getTime: function (option) {
    return moment.tz("Asia/Kolkata").format({
      seconds: "ss",
      minutes: "mm",
      hours: "HH",
      date: "DD",
      month: "MM",
      year: "YYYY",
      fullHour: "HH:mm:ss",
      fullYear: "DD/MM/YYYY",
      fullTime: "HH:mm:ss DD/MM/YYYY"
    }[option]);
  }
};

global.data = {
  threadInfo: new Map(),
  threadData: new Map(),
  userName: new Map(),
  userBanned: new Map(),
  threadBanned: new Map(),
  commandBanned: new Map(),
  threadAllowNSFW: [],
  allUserID: [],
  allCurrenciesID: [],
  allThreadID: []
};

global.utils = require("./utils");
global.nodemodule = {};
global.config = {};
global.configModule = {};
global.moduleData = [];
global.language = {};

let configValue;
try {
  global.client.configPath = join(global.client.mainPath, "config.json");
  configValue = require(global.client.configPath);
  logger.loader("Found file config: config.json");
} catch {
  const tempPath = global.client.configPath.replace(/\.json$/, ".temp");
  if (existsSync(tempPath)) {
    configValue = JSON.parse(readFileSync(tempPath));
    logger.loader(`Found: ${tempPath}`);
  } else return logger.loader("config.json not found!", "error");
}

try {
  Object.assign(global.config, configValue);
  logger.loader("Config Loaded!");
} catch {
  return logger.loader("Can't load file config!", "error");
}

const { Sequelize, sequelize } = require("./includes/database");
writeFileSync(global.client.configPath + ".temp", JSON.stringify(global.config, null, 4), 'utf8');

const langFile = readFileSync(`${__dirname}/languages/${global.config.language || "en"}.lang`, 'utf-8').split(/\r?\n|\r/);
for (const line of langFile.filter(l => l && !l.startsWith('#'))) {
  const [key, ...rest] = line.split('=');
  const head = key.split('.')[0];
  const subKey = key.replace(`${head}.`, '');
  const value = rest.join('=').replace(/\\n/g, '\n');
  if (!global.language[head]) global.language[head] = {};
  global.language[head][subKey] = value;
}

global.getText = function (...args) {
  const langText = global.language;
  if (!langText[args[0]]) throw `Language key not found: ${args[0]}`;
  let text = langText[args[0]][args[1]];
  for (let i = 2; i < args.length; i++) {
    text = text.replace(new RegExp(`%${i - 1}`, 'g'), args[i]);
  }
  return text;
};

let appState;
try {
  const appStateFile = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
  appState = require(appStateFile);
  logger.loader(global.getText("rudra", "foundPathAppstate"));
} catch {
  return logger.loader(global.getText("rudra", "notFoundPathAppstate"), "error");
}

function onBot({ models: botModel }) {
  const appStateFile = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
  login({ appState }, async (loginError, loginApiData) => {
    if (loginError) return logger(JSON.stringify(loginError), "ERROR");

    loginApiData.setOptions(global.config.FCAOption);
    writeFileSync(appStateFile, JSON.stringify(loginApiData.getAppState(), null, '\t'));
    global.client.api = loginApiData;
    global.config.version = '1.2.14';
    global.client.timeStart = Date.now();

    (() => {
      const listCommand = readdirSync(join(global.client.mainPath, '/Rudra/commands'))
        .filter(f => f.endsWith('.js') && !f.includes('example') && !global.config.commandDisabled.includes(f));

      for (const file of listCommand) {
        try {
          const command = require(join(global.client.mainPath, '/Rudra/commands', file));
          if (!command.config || !command.run || !command.config.commandCategory) throw new Error(global.getText('rudra', 'errorFormat'));
          global.client.commands.set(command.config.name, command);
          logger.loader(global.getText('rudra', 'successLoadModule', command.config.name));
        } catch (err) {
          logger.loader(global.getText('rudra', 'failLoadModule', file, err.message), 'error');
        }
      }
    })();

    (() => {
      const events = readdirSync(join(global.client.mainPath, '/Rudra/events'))
        .filter(e => e.endsWith('.js') && !global.config.eventDisabled.includes(e));

      for (const file of events) {
        try {
          const event = require(join(global.client.mainPath, '/Rudra/events', file));
          if (!event.config || !event.run) throw new Error(global.getText('rudra', 'errorFormat'));
          global.client.events.set(event.config.name, event);
          logger.loader(global.getText('rudra', 'successLoadModule', event.config.name));
        } catch (err) {
          logger.loader(global.getText('rudra', 'failLoadModule', file, err.message), 'error');
        }
      }
    })();

    logger.loader(global.getText('rudra', 'finishLoadModule', global.client.commands.size, global.client.events.size));
    logger.loader(`Startup Time: ${((Date.now() - global.client.timeStart) / 1000).toFixed()}s`);
    writeFileSync(global.client.configPath, JSON.stringify(global.config, null, 4), 'utf8');
    unlinkSync(global.client.configPath + ".temp");

    const listener = require('./includes/listen')({ api: loginApiData, models: botModel });
    global.handleListen = loginApiData.listenMqtt((err, message) => {
      if (err) return logger(global.getText('rudra', 'handleListenError', JSON.stringify(err)), 'error');
      if (!['presence', 'typ', 'read_receipt'].includes(message.type)) return listener(message);
    });
  });
}

(async () => {
  try {
    await sequelize.authenticate();
    const models = require('./includes/database/model')({ Sequelize, sequelize });
    logger(global.getText('rudra', 'successConnectDatabase'), '[ DATABASE ]');
    onBot({ models });
  } catch (error) {
    logger(global.getText('rudra', 'failConnectDatabase', error.message), '[ DATABASE ]');
  }
})();

process.on('unhandledRejection', (err, p) => {});
