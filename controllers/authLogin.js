const mysql = require('mysql2')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const db = mysql.createConnection({
    //environment variables to hide confidential data
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

exports.login = function (req, res) {
    const { username, password } = req.body;
  
    // Retrieve user data from the database
    db.query(
      'SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) throw err;
  
        if (results.length > 0) {
          const user = results[0];
  
          // Compare the hashed password
          bcrypt.compare(password, user.password, (err, match) => {
            if (err) throw err;
  
            if (match) {
              // Store user data in the session
              req.session.user = user;
              res.render('dashboard', { user: req.session.user });
            } else {
              return res.render('login', {
                message: "Incorrect Password"
              })
            }
          });
        } else {
          return res.render('login', {
              message: "No User Found"
          })
        }
      }
    );
};