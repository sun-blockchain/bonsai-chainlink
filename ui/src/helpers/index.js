import BigNumber from 'bignumber.js';
import { Transaction } from 'ethereumjs-tx';

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
export const getBalanceERC20 = async (instanceOxygen, walletAddress, web3) => {
  try {
    let result = await instanceOxygen.methods.balanceOf(walletAddress).call();
    result = web3.utils.fromWei(result, 'ether');
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
  return new Promise(async (resolve) => {
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
          resolve(true);
          return receipt;
        });
    } catch (err) {
      console.log({ err });
      resolve(false);
    }
  });
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
export const mintERC721To = async (nonce, web3, instanceBonsai, address, item) => {
  return new Promise(async (resolve) => {
    try {
      const data = instanceBonsai.methods.mint(address, item.name, item.price).encodeABI();
      const txParams = {
        nonce,
        gasPrice: '0x09184e72a000',
        gasLimit: '0x927C0',
        to: instanceBonsai._address,
        value: '0x00',
        data,
      };
      const privateKey = Buffer.from(process.env.REACT_APP_OWNER_PRIVATE_KEY, 'hex');
      console.log({ privateKey });
      const tx = new Transaction(txParams);
      tx.sign(privateKey);
      const serializedTx = tx.serialize();
      web3.eth
        .sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .then(async function (receipt) {
          console.log('receive', { receipt });
          resolve(true);
        });
    } catch (err) {
      console.log({ err });
      resolve(false);
    }
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

export const receiveOxygen = async (nonce, web3, instanceOxygen, address, numBonsais) => {
  return new Promise(async (resolve) => {
    try {
      const data = instanceOxygen.methods.receiveOxygen(address, numBonsais).encodeABI();
      const txParams = {
        nonce,
        gasPrice: '0x09184e72a000',
        gasLimit: '0x927C0',
        to: instanceOxygen._address,
        value: '0x00',
        data,
      };
      const privateKey = Buffer.from(process.env.REACT_APP_OWNER_PRIVATE_KEY, 'hex');
      const tx = new Transaction(txParams, { chain: 'ropsten', hardfork: 'petersburg' });
      tx.sign(privateKey);
      const serializedTx = tx.serialize();
      web3.eth
        .sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .then(async function (receipt) {
          console.log('receive', { receipt });
          resolve(true);
        });
    } catch (err) {
      console.log({ err });
      resolve(false);
    }
  });
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
