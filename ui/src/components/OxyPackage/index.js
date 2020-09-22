import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Col, Button, Dropdown, Menu } from 'antd';
import { getTokenPrice, buyOxygenWithErc } from 'helpers';

export default function OxyPackage({ item, onBuyPlant, unit }) {
  const state = useSelector((state) => state);
  const [ethPrice, setEthPrice] = useState(0);
  const [linkPrice, setLinkPrice] = useState(0);
  const [daiPrice, setDaiPrice] = useState(0);

  useEffect(() => {
    const getPrice = async () => {
      let ethPrice = await getTokenPrice(state.instanceOxygen, 0);
      let linkPrice = await getTokenPrice(state.instanceOxygen, 1);
      let daiPrice = await getTokenPrice(state.instanceOxygen, 2);
      setEthPrice(Number((item.price / ethPrice).toFixed(5)));
      setLinkPrice(Number((item.price / linkPrice).toFixed(5)));
      setDaiPrice(Number((item.price / daiPrice).toFixed(5)));
    };
    getPrice();
  }, [state.instanceOxygen, item.price]);

  const onBuyPlantWithERC = async (state, tokenType, amount, price) => {
    if (tokenType === 1) {
      await buyOxygenWithErc(state.instanceLink, state, amount, price);
    } else if (tokenType === 2) {
      await buyOxygenWithErc(state.instanceDai, state, amount, price);
    }
  };

  const menu = (ethPrice, linkPrice, daiPrice, item, state) => (
    <Menu>
      <Menu.Item>
        <Button className='w-100' onClick={onBuyPlant}>
          <strong>{ethPrice} ETH</strong>
        </Button>
      </Menu.Item>
      <Menu.Item>
        <Button
          className='w-100'
          onClick={() => onBuyPlantWithERC(state, 1, linkPrice, item.price)}
        >
          <strong>{linkPrice} LINK</strong>
        </Button>
      </Menu.Item>
      <Menu.Item>
        <Button className='w-100' onClick={() => onBuyPlantWithERC(state, 2, daiPrice, item.price)}>
          <strong>{daiPrice} DAI</strong>
        </Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <Col className='gutter-row r-bot-10px r-top-10px' span={8}>
      <div className='align-center'>
        <strong> {item.name} </strong>
      </div>

      <div className='bg-swapItem'>
        <img src={item.plantImg} className=' h-160px w-100 ' alt='' />
      </div>

      <div>
        <Dropdown
          className='w-100 r-bot-10px'
          type='primary'
          overlay={menu(ethPrice, linkPrice, daiPrice, item, state)}
          placement='bottomCenter'
        >
          <Button>
            <strong>
              {item.price} {unit}
            </strong>
          </Button>
        </Dropdown>
      </div>
    </Col>
  );
}
