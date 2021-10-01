//required packages
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');

//required modules
const { urlDatabase, users } = require('./db');
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers/helper');
const { invalidForm } = require('./helpers/validation');
const { redirectToUrls, authenticateUser } = require('./helpers/authentication');

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

//middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['%jclanLjsH#!BQ83', 'skf#SL48lp2*0aP']
}));

//ROUTES

//root path
app.get("/", redirectToUrls);

//Code to get Registration User Form
app.get("/register", redirectToUrls, (req, res) => {
  const templateVars = { user: null, elements: {}, errors:{} };
  res.render('user_register', templateVars);
});

//Code to Register user by adding user data to db object and set cookie
app.post("/register", invalidForm, (req, res) => {
  const email = req.body.email;
  let password = req.body.password;

  //calling getUserByEmail to check if user exist or not!
  const foundUser = getUserByEmail(email, users);

  if (foundUser) {
    res.status(404);
    const templateVars = { user: null, elements: { email }, errors: {emailError: 'User already Exist!'} };
    res.render('user_register', templateVars);
    return;
  }

  //if youser doesn't exist create random id and store new user to db object
  const userId = generateRandomString();
  password = bcrypt.hashSync(password, 10);
  users[userId] = {
    id: userId,
    email,
    password
  };

  //set cookie
  req.session['user_id'] = userId;
  res.redirect('/urls');
});

//Code to get User Login Form
app.get("/login", redirectToUrls, (req, res) => {
  const templateVars = { user: null, elements: {}, errors: {} };
  res.render('user_login', templateVars);
});

//Code to Login
app.post("/login", invalidForm, (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //authenticateUser function to authenticate user
  const autheticatedUser = authenticateUser({ email, password }, users);
  //if autheticatedUser status is false, return html with error
  if (!autheticatedUser.status) {
    res.status(403);
    const templateVars = {
      user: null,
      elements: { email },
      errors: {
        emailError: autheticatedUser.emailError,
        passwordError: autheticatedUser.passwordError
      }
    };

    res.render('user_login', templateVars);
    return;
  }

  //set cookie
  req.session['user_id'] = autheticatedUser.user.id;
  res.redirect('/urls');
});

//Code to Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//get route handler for /urls endpoint
app.get("/urls", (req, res) => {
  const loggedInUserId = req.session["user_id"];
  const user = users[loggedInUserId];
  const filteredURLs = urlsForUser(loggedInUserId, urlDatabase);
  const templateVars = { user, urls: filteredURLs, errors: {} };
  res.render("urls_index", templateVars);
});

//post route handler for /urls endpoint
app.post("/urls", redirectToUrls, (req, res) => {
  const loggedInUserId = req.session["user_id"];
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL]['longURL'] = req.body.longURL;
  urlDatabase[shortURL]['userID'] = loggedInUserId;
  res.redirect('/urls/' + shortURL);
});

//get route handler for /urls/new endpoint
app.get("/urls/new", redirectToUrls, (req, res) => {
  const loggedInUserId = req.session["user_id"];

  const user = users[loggedInUserId];
  const templateVars = { user};
  res.render("urls_new", templateVars);
});

//get route handler for /urls/:shortURL endpoint
app.get("/urls/:shortURL",
  (req, res, next) => {
    res.locals.users = users;
    res.locals.urlDatabase = urlDatabase;
    next();
  },
  redirectToUrls,
  (req, res) => {
    const templateVars = { user: res.locals.user , urls: res.locals.urls , errors: {} };
    res.render("urls_show", templateVars);
  }
);

// Code to Update longURL
app.post("/urls/:shortURL",
  (req, res, next) => {
    res.locals.users = users;
    res.locals.urlDatabase = urlDatabase;
    next();
  },
  redirectToUrls,
  (req, res) => {
    const shortURL = req.params.shortURL;
    const newLongURL = req.body.newURL;
    urlDatabase[shortURL]['longURL'] = newLongURL;

    res.redirect('/urls');
  }
);

//get route handler for /u/:shortURL endpoint
app.get("/u/:shortURL",
  (req, res, next) => {
    res.locals.users = users;
    res.locals.urlDatabase = urlDatabase;
    next();
  },
  redirectToUrls,
  (req, res) => {
    res.redirect(res.locals.longURL);
  }
);

//Code to Delete shortURL from params
app.post("/urls/:shortURL/delete",
  (req, res, next) => {
    res.locals.users = users;
    res.locals.urlDatabase = urlDatabase;
    next();
  },
  redirectToUrls,
  (req, res) => {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
);

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});