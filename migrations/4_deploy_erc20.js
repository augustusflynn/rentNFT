const Token = artifacts.require("Token");

module.exports = function (deployer) {
  deployer.deploy(Token, "Tether USD", "USDT", 1000);
};
