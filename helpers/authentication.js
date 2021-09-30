const bcrypt = require('bcryptjs');
const { getUserByEmail } = require('./helper');

const authenticateUser = function(formElements, users) {
  const email = formElements.email;
  const password = formElements.password;

  const user = getUserByEmail(email, users);

  if (!user) {
    return { status: false, emailError: 'User Email does not Exist!', passwordError: '' };
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return { status: false, emailError: '', passwordError: 'Password doesn\'t Match!' };
  }

  return { status: true, user };
};

module.exports = { authenticateUser };