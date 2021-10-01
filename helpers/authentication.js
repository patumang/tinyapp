const bcrypt = require('bcryptjs');
const { getUserByEmail, getLongURL } = require('./helper');

const redirectToUrls = function(req, res, next) {
  const loggedInUserId = req.session["user_id"];
  const path = req.path;
  const redirectToUrlsPaths = ["/", "/register", "/login"];

  if (loggedInUserId && redirectToUrlsPaths.includes(path)) {
    return res.redirect("/urls");
  }

  const redirectToLoginPaths = ["/", "/urls", "/urls/new"];
  if (!loggedInUserId && redirectToLoginPaths.includes(path)) {
    return res.status(403).redirect("/login");
  }

  const shortURL = req.params.shortURL;
  if (shortURL) {
    let user = null;
    let urls = {};

    if (loggedInUserId) {
      user = res.locals.users[loggedInUserId];
    }

    if (!res.locals.urlDatabase[shortURL]) {
      const templateVars = { user, urls, errors: { urlError: 'Input short URL is not valid!' } };
      return res.status(403).render("urls_show", templateVars);
    }

    if (req.method === 'GET') {
      const longURL = getLongURL(shortURL, res.locals.urlDatabase);
      if (path.substr(0, 6) === '/urls/') {
        urls = { shortURL, longURL };
        res.locals.urls = urls;
        res.locals.user = user;
      } else {
        if (!longURL) {
          const templateVars = { user, urls, errors: { urlError: 'Sorry can\'t find URL!' } };
          return res.status(403).render("urls_show", templateVars);
        } else {
          res.locals.longURL = longURL;
          next();
        }
      }
    }

    if (!loggedInUserId) {
      const templateVars = { user, urls, errors: { userError: 'You are not logged in currently!' } };
      return res.status(403).render("urls_show", templateVars);
    }

    if (loggedInUserId && loggedInUserId !== res.locals.urlDatabase[shortURL]['userID']) {
      const templateVars = { user, urls, errors: { userError: 'You doesn\'t own this URL!' } };
      return res.status(403).render("urls_show", templateVars);
    }
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