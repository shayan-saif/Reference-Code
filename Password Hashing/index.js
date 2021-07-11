const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Salt rounds, 10 is typically quick and safe
const saltRounds = 10;

const port = process.env.PORT || 3000;
const www = process.env.WWW || './';
app.use(express.static(www));

// Connection info for your Postgres database here
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'shayan',
  port: 5432
});

pool.connect().catch((err) => console.log(err));
// Create table for users
pool.query('CREATE TABLE IF NOT EXISTS users (user_id INT GENERATED ALWAYS AS IDENTITY, username varchar(32) UNIQUE NOT NULL , hash varchar(255) NOT NULL, PRIMARY KEY(user_id))');

// Register route, POST username and password data
app.post('/register', async (req, res) => {
  const { username, password } = req.body

  bcrypt.genSalt(saltRounds, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      // Get the hash from the plaintext variable 'password', insert into database
      pool.query('INSERT INTO users (username, hash) VALUES ($1, $2) RETURNING *', [username, hash])
        .then((entry) => {
          res.status(201).json(entry.rows[0]);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "Error creating user" })
        });
    });
  });
});


// Login route, POST username and password data
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Retrieve hash for a given username
  pool.query('SELECT hash FROM users WHERE username = $1', [username])
    .then((entry) => {
      const hash = entry.rows[0].hash;

      // Compare the plaintext 'password' variable to the stored hash
      bcrypt.compare(password, hash, function (err, result) {
        // Send true/false
        res.send(result);
      });
    })
    .catch((err) => {
      console.log(err.table);
      res.status(500).json({ message: "Error checking user" });
    });

});

app.listen(port, () => console.log(`listening on http://localhost:${port}`));



