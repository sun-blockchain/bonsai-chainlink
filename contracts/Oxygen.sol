pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";


contract Oxygen is ERC20, Ownable {
    AggregatorV3Interface internal priceFeed;
    using SafeMath for uint256;
    
    mapping (address => uint256) public lastTimeReceiveOxygen;
    mapping (address => bool) public airDropped;

    uint256 public amountOxygenReceiveOneTime;
    uint256 public scopeTimeReceiveOxygen;
    uint256 public ethPrice;
    
    constructor(address oracle, uint256 amountOxygen, uint256 scopeTime) public ERC20("Oxygen", "OX") {
        priceFeed = AggregatorV3Interface(oracle); 
        amountOxygenReceiveOneTime = amountOxygen;
        scopeTimeReceiveOxygen = scopeTime;
    }

    function getLatestPrice() public returns (int) {
        (
            uint80 roundID, 
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        // If the round is not complete yet, timestamp is 0
        require(timeStamp > 0, "Round not complete");
        ethPrice = uint256(price);
        return price;
    }

    function dollarToWei(uint256 amount) public view returns (uint256)  {
        uint256 result = amount.mul(10 ** 18).div(ethPrice);
        result = result.mul(100000000);
        return result;
    }

    function airDrop(address recipient) public onlyOwner {
        require(!airDropped[recipient], "This address has air dropped");
        require(balanceOf(recipient) == 0, "This address has already oxygen");

        _mint(recipient, 3000);
        airDropped[recipient] = true;
    }

    function receiveOxygen(address recipient, uint256 numberOfBonsai) public onlyOwner {
        uint256 lastTimeReceive = lastTimeReceiveOxygen[recipient];

        if (lastTimeReceive == 0) {
            lastTimeReceiveOxygen[recipient] = now;
            return;
        }
       
        uint256 waitingTime = now.sub(lastTimeReceive);
        require(waitingTime > scopeTimeReceiveOxygen, "Not enough time to receive Oxy");

        uint256 timesReceive = waitingTime.div(scopeTimeReceiveOxygen);
        uint256 totalReceive = timesReceive.mul(amountOxygenReceiveOneTime.mul(numberOfBonsai));

        _mint(recipient, totalReceive);
        lastTimeReceiveOxygen[recipient] = lastTimeReceiveOxygen[recipient].add(scopeTimeReceiveOxygen.mul(timesReceive));
    }

    function buyOxygen() public payable {
        require(msg.value > 0, "Amount can not less than zero");

        uint amountOxygen = 0;

        if (msg.value == dollarToWei(1)) {
            amountOxygen = 1000;
        }

        if (msg.value == dollarToWei(5)) {
            amountOxygen = 10000;
        }

        if (msg.value == dollarToWei(10)) {
            amountOxygen = 100000;
        }

        _mint(msg.sender, amountOxygen);
    }

    function withDrawEther(uint value) public onlyOwner {
        require(value > 0 && value <= address(this).balance, "Value out of range");
        msg.sender.transfer(value);
    }
    
     function getWaitingTimeOfUser(address user) public view returns (uint256){
        return now.sub(lastTimeReceiveOxygen[user]);
    }
}
