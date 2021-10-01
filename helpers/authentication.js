const bcrypt = require('bcryptjs');
const { getUserByEmail, getLongURL } = require('./helper');

//function to redirect or render pages
const redirectToUrls = function(req, res, next) {
  //get current user id
  const loggedInUserId = req.session["user_id"];
  const path = req.path;

  //if already logged in redirect to /urls from redirectToUrlsPaths urls
  const redirectToUrlsPaths = ["/", "/register", "/login"];
  if (loggedInUserId && redirectToUrlsPaths.includes(path)) {
    return res.redirect("/urls");
  }

  //if not logged in redirect to /login from redirectToLoginPaths urls
  const redirectToLoginPaths = ["/", "/urls", "/urls/new"];
  if (!loggedInUserId && redirectToLoginPaths.includes(path)) {
    return res.status(403).redirect("/login");
  }

  //store shortURL and chek if it is set
  const shortURL = req.params.shortURL;
  if (shortURL) {
    let user = null;
    let urls = {};

    //store logged in user value from users db
    if (loggedInUserId) {
      user = res.locals.users[loggedInUserId];
    }

    //if shorturl is invalid or not in urlDatabase render urls_show template with error message
    if (!res.locals.urlDatabase[shortURL]) {
      const templateVars = { user, urls, errors: { urlError: 'Input short URL is not valid!' } };
      return res.status(403).render("urls_show", templateVars);
    }

    if (req.method === 'GET') {
      //get longURL value of given shortURL
      const longURL = getLongURL(shortURL, res.locals.urlDatabase);
      //check if current path is /url/:shortURL
      if (path === `/urls/${shortURL}`) {
        urls = { shortURL, longURL };
        res.locals.urls = urls;
        res.locals.user = user;
      } else if (path === `/u/${shortURL}`) {
        //if longURL is not in urlDatabase for given shortURL then render urls_show template with error message
        if (!longURL) {
          const templateVars = { user, urls, errors: { urlError: 'Sorry can\'t find URL!' } };
          return res.status(403).render("urls_show", templateVars);
        } else {
          res.locals.longURL = longURL;
          next();
        }
      }
    }

    //if not logged in render urls_show template with error message
    if (!loggedInUserId) {
      const templateVars = { user, urls, errors: { userError: 'You are not logged in currently!' } };
      return res.status(403).render("urls_show", templateVars);
    }

    //if user doesn't own this URL render urls_show template with error message
    if (loggedInUserId && loggedInUserId !== res.locals.urlDatabase[shortURL]['userID']) {
      const templateVars = { user, urls, errors: { userError: 'You doesn\'t own this URL!' } };
      return res.status(403).render("urls_show", templateVars);
    }
  }

  next();
};

//function to authenticate user
const authenticateUser = function(formElements, users) {
  const email = formElements.email;
  const password = formElements.password;

  //find user by email in users db
  const user = getUserByEmail(email, users);

  //if user not found, return with error message
  if (!user) {
    return { status: false, emailError: 'User Email does not Exist!', passwordError: '' };
  }

  //if password doesn't match, return with error message
  if (!bcrypt.compareSync(password, user.password)) {
    return { status: false, emailError: '', passwordError: 'Password doesn\'t Match!' };
  }

  return { status: true, user };
};

module.exports = { redirectToUrls, authenticateUser };