const getUserByEmail = function (email, users) {

  for (let userId in users) {
    if (users[userId]['email'] === email) {
      return users[userId];
    }
  }

};

module.exports = { getUserByEmail };