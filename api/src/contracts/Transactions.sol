//pragma solidity ^0.4.1;
/** @title Transactions*/
contract Transactions is Owned, RolesInterface {

  Roles roles;

  function Transactions(Roles rolesAddr) RolesInterface (rolesAddr) {

  }

  event Transaction(
    address indexed bankAddress,
    string from,
    string to,
    uint amount,
    string currency,
    string description);

  function report(
    string from,
    string to,
    uint amount,
    string currency,
    string description) {
      Transaction(msg.sender, from, to, amount, currency, description);
    }
}
