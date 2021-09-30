const getUserByEmail = function(email, users) {

  for (let userId in users) {
    if (users[userId]['email'] === email) {
      return users[userId];
    }
  }

};

const getLongURL = function(shortURL, urlDatabase) {
  if (urlDatabase[shortURL]) {
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

const urlsForUser = function(id, urlDatabase) {
  const filteredURLs = {};
  for (let urlId in urlDatabase) {
    if (urlDatabase[urlId]['userID'] === id) {
      filteredURLs[urlId] = urlDatabase[urlId];
    }
  }
  return filteredURLs;
};

module.exports = { getUserByEmail, getLongURL, generateRandomString, urlsForUser };