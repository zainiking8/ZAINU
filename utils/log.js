const chalk = require("chalk");

module.exports = (msg, type) => {
  switch (type) {
    case "warn":
      console.log(chalk.bold.hex("#FF00FF")("[ Rudra ] » ") + msg);
      break;
    case "error":
      console.log(chalk.bold.hex("#ff334b")("[ Error ] » ") + msg);
      break;
    default:
      console.log(chalk.bold.hex("#FF0000")(type + " » ") + msg);
      break;
  }
};

module.exports.loader = (msg, type) => {
  switch (type) {
    case "warn":
      console.log(chalk.bold.hex("#b4ff33")("[ Rudra ] » ") + msg);
      break;
    case "error":
      console.log(chalk.bold.hex("#ff334b")("[ Error ] » ") + msg);
      break;
    default:
      console.log(chalk.bold.hex("#33ffc9")("[ Rudra ] » ") + msg);
      break;
  }
};
