import IconService, { HttpProvider, IconBuilder } from 'icon-sdk-js';
import BigNumber from 'bignumber.js';

const provider = new HttpProvider(process.env.REACT_APP_API_ENPOINT);
const iconService = new IconService(provider);

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// get balance native token
export const getBalanceNativeToken = async (web3, address) => {
  if (web3) {
    return web3.utils.fromWei(await web3.eth.getBalance(address), 'ether');
  }
};

// get balance erc-20
export const getBalanceERC20 = async (address, instanceOxygen) => {
  try {
    let result = await instanceOxygen.methods.balanceOf(address).call();
    result /= 1000000000000000000;
    result = Math.floor(result);
    return result;
  } catch (error) {
    console.log(error);
  }
};

// get balance erc-721
export const getBalanceERC721 = async (address, instanceBonsai) => {
  try {
    const result = await instanceBonsai.methods.getPlantsByOwner(address).call();
    return result;
  } catch (error) {
    console.log(error);
  }
};

// airdrop 3000 oxygen for first-time users play
export const airDropERC20 = async (web3, instanceOxygen, address) => {
  const owner = process.env.REACT_APP_OWNER_ADDRESS;
  const privateKeyOwner = process.env.REACT_APP_OWNER_PRIVATE_KEY;
  try {
    web3.eth.accounts.wallet.add({
      privateKey: privateKeyOwner,
      address: owner,
    });
    instanceOxygen.methods
      .airDrop(address)
      .send({ from: owner, gas: 300000 })
      .then(function (receipt) {
        web3.eth.accounts.wallet.remove(owner);
        return receipt;
      });
  } catch (err) {
    console.log({ err });
  }
};

// transfer oxy to buy bonsai
export const transferERC20To = async (instanceOxygen, address, amount) => {
  let unitWei = new BigNumber(1000000000000000000);
  amount = unitWei.multipliedBy(amount);
  try {
    return await instanceOxygen.methods
      .transfer(process.env.REACT_APP_OWNER_ADDRESS, amount)
      .send({ from: address });
  } catch (err) {
    return err;
  }
};

// mint bonsai after transfer oxy successfully
export const mintERC721To = async (web3, instanceBonsai, address, item) => {
  const owner = process.env.REACT_APP_OWNER_ADDRESS;
  const privateKeyOwner = process.env.REACT_APP_OWNER_PRIVATE_KEY;
  try {
    web3.eth.accounts.wallet.add({
      privateKey: privateKeyOwner,
      address: owner,
    });

    instanceBonsai.methods
      .mint(address, item.name, item.price)
      .send({ from: owner, gas: 300000 })
      .then(function (receipt) {
        web3.eth.accounts.wallet.remove(owner);
        return receipt;
      });
  } catch (err) {
    console.log({ err });
  }
};

// get transaction result success or not
export const isTxSuccess = (txHash) => {
  return new Promise(async (resolve, reject) => {
    await sleep(5000);
    const txObject = await iconService.getTransactionResult(txHash).execute();
    if (txObject['status'] === 1) {
      resolve(true);
    } else return resolve(false);
  });
};

// is newbie
export const airDropped = async (address, instanceOxygen) => {
  try {
    const result = await instanceOxygen.methods.airDropped(address).call();
    return result;
  } catch (err) {
    console.log({ err });
  }
};

export const receiveOxygen = async (web3, instanceOxygen, address, numBonsais) => {
  const owner = process.env.REACT_APP_OWNER_ADDRESS;
  const privateKeyOwner = process.env.REACT_APP_OWNER_PRIVATE_KEY;
  try {
    web3.eth.accounts.wallet.add({
      privateKey: privateKeyOwner,
      address: owner,
    });
    instanceOxygen.methods
      .receiveOxygen(address, numBonsais)
      .send({ from: owner, gas: 600000 })
      .then(function (receipt) {
        web3.eth.accounts.wallet.remove(owner);
        return receipt;
      });
  } catch (err) {
    console.log({ err });
  }
};

export const buyOxygen = async (instanceOxygen, address, amount) => {
  try {
    let price = await instanceOxygen.methods.getLatestPrice().call();
    price = new BigNumber(price);
    amount = price.multipliedBy(amount);
    const result = await instanceOxygen.methods.buyOxygen().send({ from: address, value: amount });
    return result;
  } catch (err) {
    return err;
  }
};

export const transferBonsai = async (instanceBonsai, from, to, bonsaiId) => {
  try {
    const result = await instanceBonsai.methods.safeTransferFrom(from, to, bonsaiId).send({ from });
    return result;
  } catch (err) {
    console.log({ err });
  }
};

// get Plant Dict from contract
export const getPlantDict = async (instanceBonsai, address) => {
  try {
    const result = await instanceBonsai.methods.plantDict(address).call();
    return result;
  } catch (err) {}
};

// set Plant Dict
export const setPlantDict = async (web3, instanceBonsai, plantsDict, address) => {
  const owner = process.env.REACT_APP_OWNER_ADDRESS;
  const privateKeyOwner = process.env.REACT_APP_OWNER_PRIVATE_KEY;
  try {
    web3.eth.accounts.wallet.add({
      privateKey: privateKeyOwner,
      address: owner,
    });
    instanceBonsai.methods
      .setPlantDict(JSON.stringify(plantsDict), address)
      .send({ from: owner, gas: 1465000 })
      .then(function (receipt) {
        web3.eth.accounts.wallet.remove(owner);
        return receipt;
      });
  } catch (err) {
    console.log({ err });
  }
};

// Get detail bonsai when transfer it
export const getTransferBonsaiID = async (txHash) => {
  return new Promise(async (resolve, reject) => {
    await sleep(5000);
    const txObject = await iconService.getTransactionResult(txHash).execute();
    if (txObject['status'] === 1) {
      const data = txObject.eventLogs[0].indexed[3];
      resolve(data);
    } else return resolve(false);
  });
};
