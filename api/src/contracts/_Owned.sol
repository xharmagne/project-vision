pragma solidity ^0.4.1;

contract Owned {
  address owner;

  function Owned() {
    owner = msg.sender;
  }

  function changeOwner(address newOwner) mustOwn {
    owner = newOwner;
  }

  modifier mustOwn {
    require(msg.sender == owner);
    _;
  }
}
