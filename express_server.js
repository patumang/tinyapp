const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');

const { urlDatabase, users } = require('./db');
const { getUserByEmail, getLongURL, generateRandomString, urlsForUser } = require('./helpers/helper');
const { isFormInvalid } = require('./helpers/validation');
const { authenticateUser } = require('./helpers/authentication');

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['%jclanLjsH#!BQ83', 'skf#SL48lp2*0aP']
}));

app.use((req, res, next) => {
  const loggedInUserId = req.session["user_id"];
  const path = req.path;
  const allowedPaths = ["/", "/register", "/login"];

  if (loggedInUserId && allowedPaths.includes(path)) {
    return res.redirect("/urls");
  }

  next();
});


//Code to get Registration User Form
app.get("/register", (req, res) => {
  const templateVars = { user: null, email: '', password: '', emailError:'', passwordError:'' };
  res.render('user_register', templateVars);
});

//Code to Register user by adding user data to db object and set cookie
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  const invalidForm = isFormInvalid({email, password});
  
  if (invalidForm) {
    res.status(404);
    res.render('user_register', invalidForm);
    return;
  }

  const foundUser = getUserByEmail(email, users);

  if (foundUser) {
    res.status(404);
    const templateVars = { user: null, email, password: '', emailError: 'User already Exist!', passwordError:'' };
    res.render('user_register', templateVars);
    return;
  }

  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email,
    password
  };

  req.session['user_id'] = userId;
  res.redirect('/urls');
});

//Code to get User Login Form
app.get("/login", (req, res) => {
  const templateVars = { user: null, email: '', password: '', emailError: '', passwordError: '' };
  res.render('user_login', templateVars);
});

//Code to Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const invalidForm = isFormInvalid({ email, password });

  if (invalidForm) {
    res.status(404);
    res.render('user_login', invalidForm);
    return;
  }

  const autheticatedUser = authenticateUser({ email, password }, users);
  if (!autheticatedUser.status) {
    res.status(403);
    const templateVars = {
      user: null,
      email,
      password: '',
      emailError: autheticatedUser.emailError,
      passwordError: autheticatedUser.passwordError
    };

    res.render('user_login', templateVars);
    return;
  }

  req.session['user_id'] = autheticatedUser.user.id;
  res.redirect('/urls');
});

//Code to Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  const loggedInUserId = req.session["user_id"];
  const user = users[loggedInUserId];
  const filteredURLs = urlsForUser(loggedInUserId, urlDatabase);
  const templateVars = { user, urls: filteredURLs };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const loggedInUserId = req.session["user_id"];
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL]['longURL'] = req.body.longURL;
  urlDatabase[shortURL]['userID'] = loggedInUserId;
  res.redirect('/urls/' + shortURL);
});

app.get("/urls/new", (req, res) => {
  const loggedInUserId = req.session["user_id"];
  if (!loggedInUserId) {
    res.status(403);
    res.redirect('/login');
    return;
  }

  const user = users[loggedInUserId];
  const templateVars = { user};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    res.status(403).send('Input short URL is not valid!');
    return;
  }

  const longURL = getLongURL(shortURL, urlDatabase);

  const loggedInUserId = req.session["user_id"];

  let userCanEdit = false;

  if (loggedInUserId && loggedInUserId === urlDatabase[shortURL]['userID']) {
    userCanEdit = true;
  }
  const user = users[loggedInUserId];

  const templateVars = { user, userCanEdit, shortURL, longURL };
  res.render("urls_show", templateVars);
});

// Code to Update longURL
app.post("/urls/:shortURL", (req, res) => {
  const loggedInUserId = req.session["user_id"];

  if (!loggedInUserId) {
    res.status(403).send('You are not logged in currently!');
    return;
  }

  const shortURL = req.params.shortURL;
  const newLongURL = req.body.newURL;

  if (!urlDatabase[shortURL]) {
    res.status(403).send('Input short URL is not valid!');
    return;
  }

  if (loggedInUserId && loggedInUserId !== urlDatabase[shortURL]['userID']) {
    res.status(403).send('You doesn\'t own this URL!');
    return;
  }

  urlDatabase[shortURL]['longURL'] = newLongURL;

  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    res.status(403).send('Input short URL is not valid!');
    return;
  }

  const longURL = getLongURL(shortURL, urlDatabase);

  if (longURL === "URL Doesn't Exist!") {
    res.status(404).send("Sorry can't find URL!");
  } else {
    res.redirect(longURL);
  }
});

//Code to Delete shortURL from params
app.post("/urls/:shortURL/delete", (req, res) => {
  const loggedInUserId = req.session["user_id"];

  if (!loggedInUserId) {
    res.status(403).send('You are not logged in currently!');
    return;
  }

  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    res.status(403).send('Input short URL is not valid!');
    return;
  }

  if (loggedInUserId && loggedInUserId !== urlDatabase[shortURL]['userID']) {
    res.status(403).send('You doesn\'t own this URL!');
    return;
  }
  
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});