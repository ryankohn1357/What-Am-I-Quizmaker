const models = require('../models');

const Account = models.Account;

// render the main page view
const mainPage = (req, res) => {
  res.render('main', { csrfToken: req.csrfToken(), loggedIn: req.session.account != null });
};

// destroy the current session and go to the main page
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

// login to the account with the given username and password
const login = (request, response) => {
  const req = request;
  const res = response;

    // force cast to strings to cover some security flaws
  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are requred' });
  }

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password' });
    }

    req.session.account = Account.AccountModel.toAPI(account);

    return res.json({ redirect: '/' });
  });
};

// create a new account
const signup = (request, response) => {
  const req = request;
  const res = response;

    // cast to strings to cover up some security flaws
  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;

  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
    };

    const newAccount = new Account.AccountModel(accountData);

    const savePromise = newAccount.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      return res.json({ redirect: '/' });
    });

    savePromise.catch((err) => {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already in use.' });
      }

      return res.status(400).json({ error: 'An error occurred' });
    });
  });
};

// change the password for an existing account
const changePassword = (request, response) => {
  const req = request;
  const res = response;

  req.body.oldPassword = `${req.body.oldPassword}`;
  req.body.newPassword = `${req.body.newPassword}`;

  if (!req.body.oldPassword || !req.body.newPassword) {
    return res.status(400).json({ error: 'All fields are requred' });
  }

  const username = req.session.account.username;

  // determine if the account with the given username/password exists
  return Account.AccountModel.authenticate(username, req.body.oldPassword, (err, account) => {
    // if it doesn't exist, return error message
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    return Account.AccountModel.generateHash(req.body.newPassword, (salt, hash) => {
      const updatedAccount = account;
      updatedAccount.salt = salt;
      updatedAccount.password = hash;

      const savePromise = updatedAccount.save();

      savePromise.then(() => {
        req.session.account = Account.AccountModel.toAPI(updatedAccount);
        return res.status(204).json({ message: 'Password changed successfully' });
      });

      savePromise.catch((saveErr) => {
        console.log(saveErr);
        return res.status(400).json({ error: 'An error occurred' });
      });
    });
  });
};

const getToken = (request, response) => {
  const req = request;
  const res = response;

  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };

  res.json(csrfJSON);
};

module.exports.mainPage = mainPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signup = signup;
module.exports.getToken = getToken;
module.exports.changePassword = changePassword;
