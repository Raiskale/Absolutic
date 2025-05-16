const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const users = {}; // In-memory user store


app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: false }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend files

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (users[username]) return res.send('User already exists');
  const hashed = await bcrypt.hash(password, 10);
  users[username] = { password: hashed };
  res.send('Registered successfully!');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = username;
    return res.send(`Welcome, ${username}!`);
  }
  res.send('Login failed');
});

app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.send(`Hello ${req.session.user}, this is your dashboard`);
  } else {
    res.redirect('/login.html');
  }
});


