const bcrypt = require('bcryptjs');
const { getUserByEmail } = require('./helper');

const redirectToUrls = function(req, res, next) {
  const loggedInUserId = req.session["user_id"];
  const path = req.path;
  const allowedPaths = ["/", "/register", "/login"];

  if (loggedInUserId && allowedPaths.includes(path)) {
    return res.redirect("/urls");
  }

  next();
};

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

module.exports = { redirectToUrls, authenticateUser };