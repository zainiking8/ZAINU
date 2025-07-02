// Updated Rudra.js with centralized prefix system const moment = require("moment-timezone"); const { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } = require("fs-extra"); const { join, resolve } = require("path"); const { execSync } = require('child_process'); const logger = require("./utils/log.js"); const { logPrefix, format } = require("./prefix-handler.js"); const login = require("fca-smart-shankar"); const axios = require("axios"); const listPackage = JSON.parse(readFileSync('./package.json')).dependencies; const listbuiltinModules = require("module").builtinModules;

// Global Setup // All getText("priyansh") replaced with getText("rudra")

// Define client globals // ... (same as original, trimmed for brevity)

// Load config try { global.client.configPath = join(global.client.mainPath, "config.json"); configValue = require(global.client.configPath); logger.loader(format("System", "Found file config: config.json")); } catch { if (existsSync(global.client.configPath.replace(/.json/g,"") + ".temp")) { configValue = readFileSync(global.client.configPath.replace(/.json/g,"") + ".temp"); configValue = JSON.parse(configValue); logger.loader(format("System", Found: ${global.client.configPath.replace(/\.json/g,"")}.temp)); } else return logger.loader(format("System", "config.json not found!"), "error"); }

try { for (const key in configValue) global.config[key] = configValue[key]; logger.loader(format("System", "Config Loaded!")); } catch { return logger.loader(format("System", "Can't load file config!"), "error"); }

// Language loader const langFile = (readFileSync(${__dirname}/languages/${global.config.language || "en"}.lang, { encoding: 'utf-8' })).split(/\r?\n|\r/); const langData = langFile.filter(item => item.indexOf('#') != 0 && item != ''); for (const item of langData) { const getSeparator = item.indexOf('='); const itemKey = item.slice(0, getSeparator); const itemValue = item.slice(getSeparator + 1, item.length); const head = itemKey.slice(0, itemKey.indexOf('.')); const key = itemKey.replace(head + '.', ''); const value = itemValue.replace(/\n/gi, '\n'); if (typeof global.language[head] == "undefined") global.language[head] = {}; global.language[head][key] = value; }

// Text translation global.getText = function (...args) { const langText = global.language; if (!langText.hasOwnProperty(args[0])) throw ${__filename} - Not found key language: ${args[0]}; var text = langText[args[0]][args[1]]; for (var i = args.length - 1; i > 0; i--) { const regEx = RegExp(%${i}, 'g'); text = text.replace(regEx, args[i + 1]); } return text; };

// AppState load try { var appStateFile = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json")); var appState = require(appStateFile); logger.loader(format("System", global.getText("rudra", "foundPathAppstate"))); } catch { return logger.loader(format("System", global.getText("rudra", "notFoundPathAppstate")), "error"); }

// Login and Listen setup function onBot({ models: botModel }) { const loginData = { appState }; login(loginData, async (loginError, loginApiData) => { if (loginError) return logger(JSON.stringify(loginError), ERROR); loginApiData.setOptions(global.config.FCAOption); writeFileSync(appStateFile, JSON.stringify(loginApiData.getAppState(), null, '\t')); global.client.api = loginApiData; global.config.version = '1.2.14'; global.client.timeStart = new Date().getTime();

// Load Commands
const listCommand = readdirSync(global.client.mainPath + '/Priyansh/commands')
  .filter(command => command.endsWith('.js') && !command.includes('example') && !global.config.commandDisabled.includes(command));

for (const command of listCommand) {
  try {
    const module = require(global.client.mainPath + '/Priyansh/commands/' + command);
    if (!module.config || !module.run || !module.config.commandCategory) throw new Error(global.getText('rudra', 'errorFormat'));
    if (global.client.commands.has(module.config.name || '')) throw new Error(global.getText('rudra', 'nameExist'));

    if (!module.languages || typeof module.languages != 'object') {
      logger.loader(format("Warn", global.getText('rudra', 'notFoundLanguage', module.config.name)));
    }

    // ...load module dependencies, env configs, onLoad, etc.

    global.client.commands.set(module.config.name, module);
    logger.loader(format("Command", global.getText('rudra', 'successLoadModule', module.config.name)));
  } catch (error) {
    logger.loader(format("Command", global.getText('rudra', 'failLoadModule', module.config.name, error)), 'error');
  }
}

// Same for Events
const events = readdirSync(global.client.mainPath + '/Priyansh/events')
  .filter(event => event.endsWith('.js') && !global.config.eventDisabled.includes(event));

for (const ev of events) {
  try {
    const event = require(global.client.mainPath + '/Priyansh/events/' + ev);
    global.client.events.set(event.config.name, event);
    logger.loader(format("Event", global.getText('rudra', 'successLoadModule', event.config.name)));
  } catch (error) {
    logger.loader(format("Event", global.getText('rudra', 'failLoadModule', ev, error)), 'error');
  }
}

logger.loader(format("System", global.getText('rudra', 'finishLoadModule', global.client.commands.size, global.client.events.size)));
logger.loader(format("System", `Startup Time: ${((Date.now() - global.client.timeStart) / 1000).toFixed()}s`));
logger.loader(format("System", `===== [ ${Date.now() - global.client.timeStart}ms ] =====`));

// Start Listener
const listener = require('./includes/listen')({ api: loginApiData, models: botModel });
function listenerCallback(error, message) {
  if (error) return logger(format("Listener", global.getText('rudra', 'handleListenError', JSON.stringify(error))), 'error');
  if (["presence", "typ", "read_receipt"].includes(message.type)) return;
  if (global.config.DeveloperMode === true) console.log(message);
  return listener(message);
}
global.handleListen = loginApiData.listenMqtt(listenerCallback);

try {
  await checkBan(loginApiData);
} catch {
  return;
}
if (!global.checkBan) logger(format("GlobalBan", global.getText('rudra', 'warningSourceCode')));

}); }

// DB connect & start (async () => { try { await sequelize.authenticate(); const models = require('./includes/database/model')({ Sequelize, sequelize }); logger(format("Database", global.getText('rudra', 'successConnectDatabase'))); onBot({ models }); } catch (error) { logger(format("Database", global.getText('rudra', 'successConnectDatabase', JSON.stringify(error)))); } })();

process.on('unhandledRejection', (err, p) => {});

