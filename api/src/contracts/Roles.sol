//pragma solidity ^0.4.1;
/** @title Roles*/
contract Roles is Owned {

    /* Define Roles */
  string BANK = "bank";

  event RegisterRole(address indexed userAddress, string role);
  mapping(address => string) Role;

  /** @dev register a address to a role.
    * @param userAddress User address.
    * @param role Role of the User.
  */
  function registerRole(address userAddress, string role) mustOwn {
    Role[userAddress] = role;
    RegisterRole(userAddress, role);
  }

  /* Functions to verify different roles */
  function isBank(address userAddress) returns (bool) {
    return compare(Role[userAddress], BANK);
  }

  /** @dev Compares two strings and returns a boolean.
    * @param x String 1.
    * @param y String 2.
  */
  function compare(string x, string y) internal returns (bool) {
    bytes memory a = bytes(x);
    bytes memory b = bytes(y);
    if (a.length != b.length)
      return false;
    for (uint i = 0; i < a.length; i ++)
      if (a[i] != b[i])
        return false;
    return true;
  }

}
