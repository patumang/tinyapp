//middleware function to check for invalid form input
const invalidForm = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  //if email or password is blank store in error variable
  const emailError = email === '' ? 'Invalid Email' : '';
  const passwordError = password === '' ? 'Invalid Password' : '';

  //if any of the form input is empty return html with error message
  if (emailError || passwordError) {
    const templateVars = {
      user: null,
      elements: { email },
      errors: { emailError, passwordError}
    };
    const path = req.path;
    if (path === '/register')
      return res.status(404).render('user_register', templateVars);
    if (path === '/login')
      return res.status(404).render('user_login', templateVars);
  }

  next();
};

module.exports = { invalidForm };