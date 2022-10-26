// Import du smart contract "Storage"
const SimpleStorage = artifacts.require("SimpleStorage");
module.exports = (deployer) => {
    // Deployer le smart contract!
    deployer.deploy(SimpleStorage);
}