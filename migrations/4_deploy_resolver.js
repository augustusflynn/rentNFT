const Resolver = artifacts.require("Resolver");

module.exports = function (deployer, _, accounts) {
  deployer.deploy(Resolver, accounts[0]);
};
