const chalk = require("chalk");

module.exports = (msg, type = "info") => {
  switch (type) {
    case "warn":
      console.log(chalk.bold.hex("#FFD700")("⚠ [ Rudra ] » ") + msg);
      break;
    case "error":
      console.log(chalk.bold.hex("#ff334b")("❌ [ Rudra ] » ") + msg);
      break;
    case "success":
      console.log(chalk.bold.hex("#00FF7F")("✅ [ Rudra ] » ") + msg);
      break;
    default:
      console.log(chalk.bold.hex("#00BFFF")("ℹ️ [ Rudra ] » ") + msg);
      break;
  }
};

module.exports.loader = (msg, type = "info") => {
  switch (type) {
    case "warn":
      console.log(chalk.bold.hex("#FFD700")("⚠ [ Rudra ] » ") + msg);
      break;
    case "error":
      console.log(chalk.bold.hex("#ff334b")("❌ [ Rudra ] » ") + msg);
      break;
    case "success":
      console.log(chalk.bold.hex("#00FF7F")("✅ [ Rudra ] » ") + msg);
      break;
    default:
      console.log(chalk.bold.hex("#33ffc9")("🔷 [ Rudra ] » ") + msg);
      break;
  }
};
