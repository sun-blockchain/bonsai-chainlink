import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { airDropERC20, isTxSuccess } from 'helpers';
import * as actions from 'store/actions';

export default function AirDrop() {
  const address = useSelector((state) => state.walletAddress);
  const web3 = useSelector((state) => state.web3);
  const instance = useSelector((state) => state.instanceOxygen);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const main = async () => {
      if (address) {
        await airDropERC20(web3, instance, address);
        setVisible(true);
        // get balance oxy after airdrop
        dispatch(actions.getBalanceOxy(address));
      }
      // if not beginner
      else localStorage.setItem('noNeedTour', true);
    };

    main();
  }, [address, dispatch]);

  const handleOk = () => {
    setVisible(false);
    dispatch(actions.updateTourStep(1));
  };

  return (
    <>
      <Modal
        visible={visible}
        footer={[
          <Button key='submit' type='primary' onClick={() => handleOk(false)}>
            OK
          </Button>,
        ]}
      >
        <div className='ant-modal-confirm-body'>
          <CheckCircleTwoTone twoToneColor='#52c41a' />
          <div className='ant-modal-confirm-content'>
            You have been given 3000 Oxygen to start the game !!!
          </div>
        </div>
      </Modal>
    </>
  );
}
