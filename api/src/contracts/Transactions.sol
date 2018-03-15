//pragma solidity ^0.4.1;
/** @title Transactions*/
contract Transactions is Owned, RolesInterface {

  Roles roles;

  function Transactions(Roles rolesAddr) RolesInterface (rolesAddr) {

  }

  event Transaction(
    address indexed bankAddress,
    string id,
    string from,
    string to,
    uint amount,
    string currency,
    string description,
    uint date);

  function report(
    string id,
    string from,
    string to,
    uint amount,
    string currency,
    string description,
    uint date) {
      Transaction(msg.sender, id, from, to, amount, currency, description, date);
  }
}
