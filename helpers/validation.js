/* const isFormInvalid = function(formElements) {

  const emailError = formElements.email === '' ? 'Invalid Email' : '';
  const passwordError = formElements.password === '' ? 'Invalid Password' : '';

  if (emailError === '' && passwordError === '') {
    return false;
  }

  return {
    user: null,
    email: formElements.email,
    password: '',
    emailError,
    passwordError
  };

}; */

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