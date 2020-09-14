pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Oxygen is ERC20, Ownable {
    mapping (address => uint256) private _last_time_receive_oxygen;
    mapping (address => bool) private _air_dropped;

    uint256 public _amount_oxygen_receive_onetime;
    uint256 public _scope_time_receive_oxygen;

    constructor(uint256 initialSupply, uint256 amount_oxygen_receive_onetime, uint256 scope_time_receive_oxygen) public ERC20("Oxygen", "OX") {
        _mint(msg.sender, initialSupply);
        _amount_oxygen_receive_onetime = amount_oxygen_receive_onetime;
        _scope_time_receive_oxygen = scope_time_receive_oxygen;
    }

    function airDrop(address recipient) public onlyOwner {
        require(_air_dropped[recipient] == false, "This address has air dropped");
        require(balanceOf(recipient) > 0, "This address has already oxygen");

        transfer(recipient, 3000);
        _air_dropped[recipient] = true;
    }

    function receiveOxygen(address recipient, uint256 number_of_bonsai) public onlyOwner {
        require (now - _last_time_receive_oxygen[recipient] < _scope_time_receive_oxygen, "Not enough time to receive Oxy");

        uint lastTimeReceive = _last_time_receive_oxygen[recipient];

        if (lastTimeReceive == 0) {
            _last_time_receive_oxygen[recipient] = now;
            return;
        }

        uint timesReceive = (now - lastTimeReceive) / _scope_time_receive_oxygen;
        uint totalReceive = timesReceive * _amount_oxygen_receive_onetime * number_of_bonsai;

        transfer(recipient, totalReceive);
        _last_time_receive_oxygen[recipient] += _scope_time_receive_oxygen * timesReceive;
    }

    function buyOxygen() public payable {
        require(msg.value > 0, "Amount can not less than zero");

        uint amountOxygen = 0;

        if (msg.value == 1 ether) {
            amountOxygen = 1000;
        }

        if (msg.value == 9 ether) {
            amountOxygen = 10000;
        }

        if (msg.value == 80 ether) {
            amountOxygen = 100000;
        }

        transfer(msg.sender, amountOxygen);
    }

    function withDraw(uint value) public onlyOwner {
        msg.sender.transfer(value);
    }
}
