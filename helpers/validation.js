const invalidForm = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;


  const emailError = email === '' ? 'Invalid Email' : '';
  const passwordError = password === '' ? 'Invalid Password' : '';

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