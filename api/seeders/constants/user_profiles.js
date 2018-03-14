const bcrypt = require('bcrypt');

// Salt and hash given passowrd.
function saltAndHash(password) {
  return bcrypt.hashSync(password, 10);
}

module.exports = {
  BANK_PROFILES: [
    {
      username: 'user@bank1.com',
      password: saltAndHash('B@nk!'),
      full_name: 'Bank 1',
      role: 'bank',
      contact_number: '0400000000',
    },
  ],
};
