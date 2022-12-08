const { exec } = require("child_process")
const { networks } = require("../truffle-config")
const args = JSON.parse(process.env.npm_config_argv)

const ALLOWED_CMD_VAR = {
  NETWORK: "--network",
  CONTRACT: "--contract"
};

let contract, network = "development";

const isExistingNetwork = args.original.findIndex(_cmd => _cmd === ALLOWED_CMD_VAR.NETWORK);
if (isExistingNetwork > -1) {
  network = args.original[isExistingNetwork + 1];
}

const isExistingContractName = args.original.findIndex(_cmd => _cmd === ALLOWED_CMD_VAR.CONTRACT);
if (isExistingContractName > -1) {
  contract = args.original[isExistingContractName + 1];
} else {
  console.error(__filename, "Invalid Smart Contract");
  process.exit(1);
}

const chainId = networks[network].network_id
const contractJson = require(`../build/contracts/${contract}`)
const address = contractJson.networks[chainId].address
console.info(`Smart Contract ${contract} deployed at ${address}`);
console.info("Verifying ...");
exec(`truffle run verify ${contract}@${address} --network ${network}`, cb)

function cb(error) {
  if (error) {
    console.error(__filename, error)
    process.exit(1);
  } else {
    console.info("Verify Smart Contract Successfully!");
    process.exit(0);
  }
}
