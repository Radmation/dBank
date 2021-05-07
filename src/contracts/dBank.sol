// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./Token.sol";

contract dBank {

  // Assign Token contract to variable
  Token private token;

  // Add mappings. This is key value storage. We want to get an integer by address. Lookup a value by address. uint is in Wei.
  mapping(address => uint) public etherBalanceOf;
  mapping(address => uint) public depositStart;
  mapping(address => bool) public isDeposited;

  // Events.
  event Deposit(address indexed user, uint etherAmount, uint timeStart);
  event Withdraw(address indexed user, uint etherAmount, uint depositTime, uint interest);

  //pass as constructor argument deployed Token contract
  constructor(Token _token) public {
    //assign token deployed contract to variable
    token = _token;
  }

  function deposit() payable public {
    // Check if msg.sender didn't already deposited funds.
    require(isDeposited[msg.sender] == false, "Error, deposit already active.");

    // Check if msg.value is >= than 0.01 ETH.
    require(msg.value >= 1e16, "Error, deposit must be >= 0.01 ETH");  

    // Increase msg.sender ether deposit balance.
    etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] + msg.value;  

    // Start msg.sender hodling time.
    depositStart[msg.sender] = block.timestamp;
 
    // Set msg.sender deposit status to true.
    isDeposited[msg.sender] = true; // Activate deposit status.

    // Emit deposit event.
    emit Deposit(msg.sender, msg.value, block.timestamp);
  }

  function withdraw() public {
    require(isDeposited[msg.sender] == true, "Error, no previous deposit.");
    uint userBalance = etherBalanceOf[msg.sender];
    //check if msg.sender deposit status is true
    //assign msg.sender ether deposit balance to variable for event

    //check user's hodl time
    uint secondsInYear = 31668017;
    uint depositTime = block.timestamp - depositStart[msg.sender];

    // calc interest per second
    // Interest = 31668017 = 10% APY because:
    // 1e15 (10% of 0.01ETH) / 31577600 (seconds in 365.25 days)
    // Amount of seconds in a year * users' balance / 1e16
    // 1e16 = 0.001 ETH
    uint interestPerSecond = secondsInYear * (userBalance / 1e16);
    uint interest = interestPerSecond * depositTime;

    //calc accrued interest

    //send eth to user
    msg.sender.transfer(userBalance);
    token.mint(msg.sender, interest); // Send interest to user in form of our new token.

    //send interest in tokens to user

    //reset depositer data
    depositStart[msg.sender] = 0;
    etherBalanceOf[msg.sender] = 0;
    isDeposited[msg.sender] = false;

    // emit event
    emit Withdraw(msg.sender, userBalance, depositTime, interest);
  }

  function borrow() payable public {
    //check if collateral is >= than 0.01 ETH
    //check if user doesn't have active loan

    //add msg.value to ether collateral

    //calc tokens amount to mint, 50% of msg.value

    //mint&send tokens to user

    //activate borrower's loan status

    //emit event
  }

  function payOff() public {
    //check if loan is active
    //transfer tokens from user back to the contract

    //calc fee

    //send user's collateral minus fee

    //reset borrower's data

    //emit event
  }
}