const isFormInvalid = function(formElements) {

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

};

module.exports = { isFormInvalid };