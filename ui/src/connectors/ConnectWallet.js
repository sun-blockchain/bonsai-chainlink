import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from 'store/actions';
import { receiveOxygen } from 'helpers';
import { connectMetamask } from 'connectors';

export const ConnectWallet = () => {
  const address = useSelector((state) => state.walletAddress);
  const numBonsai = useSelector((state) => state.balanceBonsai.length);
  const web3 = useSelector((state) => state.web3);
  const instanceOxygen = useSelector((state) => state.instanceOxygen);

  const dispatch = useDispatch();

  useEffect(() => {
    const main = async () => {
      if (address) {
        dispatch(actions.getBalanceOxy());
        dispatch(actions.getBalanceBonsai());
        // request receive Oxygen
        receiveOxygen(web3, instanceOxygen, address, numBonsai);
      }
    };

    main();
  }, [address, numBonsai, dispatch, instanceOxygen, web3]);

  useEffect(() => {
    if (window.ethereum._metamask.isEnabled()) {
      connectMetamask();
    }
  }, []);

  useEffect(() => {
    // receive Oxygen every interval 30s
    let interval = setInterval(() => {
      if (address && numBonsai > 0) {
        const init = async () => {
          receiveOxygen(web3, instanceOxygen, address, numBonsai);
          dispatch(actions.getBalanceOxy());
          dispatch(actions.getBalanceBonsai());
        };
        init();
      }
      dispatch(actions.getBalanceNative(address));
    }, 30000);
    return () => clearInterval(interval);
  }, [address, dispatch, numBonsai, instanceOxygen, web3]);

  return <></>;
};
