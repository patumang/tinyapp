//function to find user by email into users db
const getUserByEmail = function(email, users) {
  for (let userId in users) {
    if (users[userId]['email'] === email) {
      return users[userId];
    }
  }
};

//function to get longURL of given shortURL from urlDatabase db
const getLongURL = function(shortURL, urlDatabase) {
  if (urlDatabase[shortURL]) {
    return urlDatabase[shortURL]['longURL'];
  }
  return false;
};

//generating random string of 6 letters
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

//return the urls which is created by given user id
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