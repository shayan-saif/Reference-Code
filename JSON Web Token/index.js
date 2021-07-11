require('dotenv').config()

const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 4200;
const www = process.env.WWW || './www';

app.use(express.static(www));
app.use(express.json());

// Arbitrary data
const posts = [
  {
    username: 'Kyle',
    secret: 'this is a secret for kyle'
  },
  {
    username: 'Jim',
    secret: 'this is a secret for jim'
  }
];

// Login route to create a unique JSON Web Token (JWT) for a username
app.post('/login', (req, res) => {
  const username = req.body.username;
  const accessToken = jwt.sign({ username: username }, process.env.ACCESS_TOKEN_SECRET);
  res.json({ accessToken: accessToken });
});

// Post route to deliver specific data for a particular user
app.get('/posts', auth, (req, res) => {
  res.json(posts.filter((post) => post.username === req.user.username));
});

// Middleware function that verifies the token is legit
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Authorization: Bearer <access token>
  const token = authHeader && authHeader.split(' ')[1];

  if(!token) return res.sendStatus(403);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if(err) return res.status(403);
    // Once the user is confirmed, set the req.user to the current user, and continue the /post route.
    req.user = user;
    next();
  })
}


app.listen(port, () => console.log(`listening on http://localhost:${port}`));
