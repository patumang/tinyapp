const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");


const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
//const { v4: uuidv4 } = require("uuid");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const getLongURL = function(shortURL) {
  if (urlDatabase[shortURL]['longURL']) {
    return urlDatabase[shortURL]['longURL'];
  }
  return "URL Doesn't Exist!";
};

const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
};

const findUser = function(email, users) {

  for (let userId in users) {
    if (users[userId]['email'] === email) {
      return users[userId];
    }
  }

  return false;
};

const isFormInvalid = function(formElements) {

  const emailError = formElements.email === '' ? 'Invalid Email' : '';
  const passwordError = formElements.password === '' ? 'Invalid Password' : '';

  if (emailError === '' && passwordError === '') {
    return false;
  }

  return {
    user: null,
    email: formElements.email,
    password: formElements.password,
    emailError,
    passwordError
  };

};

const authenticateUser = function(formElements, users) {
  const email = formElements.email;
  const password = formElements.password;

  const user = findUser(email, users);

  if (!user) {
    return { status: false, emailError: 'User Email does not Exist!', passwordError: '' };
  }

  if (user.password !== password) {
    return { status: false, emailError: '', passwordError: 'Password doesn\'t Match!' };
  }
  
  return { status: true, user};
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Code to get Registration User Form
app.get("/register", (req, res) => {
  const loggedInUserId = req.cookies["user_id"];

  if (loggedInUserId) {
    res.redirect('/urls');
  }

  const templateVars = { user: null, email: '', password: '', emailError:'', passwordError:'' };
  res.render('user_register', templateVars);
});

//Code to Register user by adding user data to db object and set cookie
app.post("/register", (req, res) => {
  const {email, password} = req.body;

  const invalidForm = isFormInvalid({email, password});
  
  if (invalidForm) {
    res.status(404);
    res.render('user_register', invalidForm);
    return;
  }

  const foundUser = findUser(email, users);

  if (foundUser) {
    res.status(404);
    const templateVars = { user: null, email, password, emailError: 'User already Exist!', passwordError:'' };
    res.render('user_register', templateVars);
    return;
  }

  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email,
    password
  };

  res.cookie('user_id', userId);
  res.redirect('/urls');

});

//Code to get User Login Form
app.get("/login", (req, res) => {
  const loggedInUserId = req.cookies["user_id"];

  if (loggedInUserId) {
    res.redirect('/urls');
  }

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
      password,
      emailError: autheticatedUser.emailError,
      passwordError: autheticatedUser.passwordError
    };

    res.render('user_login', templateVars);
    return;
  }

  res.cookie('user_id', autheticatedUser.user.id);
  res.redirect('/urls');
});

//Code to Logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  const loggedInUserId = req.cookies["user_id"];
  const user = users[loggedInUserId];
  const templateVars = { user, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const loggedInUserId = req.cookies["user_id"];
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL]['longURL'] = req.body.longURL;
  urlDatabase[shortURL]['userID'] = loggedInUserId;
  res.redirect('/urls/' + shortURL);
});

app.get("/urls/new", (req, res) => {
  const loggedInUserId = req.cookies["user_id"];
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
  const longURL = getLongURL(shortURL);

  const loggedInUserId = req.cookies["user_id"];
  const user = users[loggedInUserId];

  const templateVars = { user, shortURL, longURL };
  res.render("urls_show", templateVars);
});

// Code to Update longURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.newURL;
  urlDatabase[shortURL]['longURL'] = newLongURL;

  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = getLongURL(shortURL);

  if (longURL === "URL Doesn't Exist!") {
    res.status(404).send("Sorry can't find URL!");
  } else {
    res.redirect(longURL);
  }
});

//Code to Delete shortURL from params
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});