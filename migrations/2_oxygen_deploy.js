const Oxygen = artifacts.require('Oxygen');

module.exports = (deployer) => {
  deployer.deploy(Oxygen, 1000, 1, 30000);
};
