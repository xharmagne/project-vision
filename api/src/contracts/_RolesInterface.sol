contract RolesInterface {
  Roles roles;

  function RolesInterface(Roles rolesAddr) {
    roles = rolesAddr;
  }

  modifier isBank {
    require(roles.isBank(msg.sender));
    _;
  }
}
