const mysql = require('mysql2')
const bcrypt = require('bcryptjs')
const { validationResult, body } = require('express-validator');
const { escape } = require('validator');

const db = mysql.createConnection({
    //environment variables to hide confidential data
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
})

//allows me to grab request body data form register form
exports.register = [
    // Validate incoming input
    body('first_name')
        .notEmpty().withMessage('First name is required')
        .customSanitizer(value => value ? validator.escape(value) : ''),
    body('last_name')
        .notEmpty().withMessage('Last name is required')
        .customSanitizer(value => value ? validator.escape(value) : ''), 
    body('username')
        .isLength({ min: 6 })
        .withMessage('Username requires at least 6 characters')
        .customSanitizer(value => value ? validator.escape(value) : ''), 
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must contain at least 8 characters')
        .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
        .withMessage('Password must contain at least one uppercase letter and one special character')


    .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),

    async (req, res) => {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('register', {
          message: 'Validation errors',
          errors: errors.array()
        });
      }

    //variables
    //object destructuring 
    const { first_name, last_name, username, password, passwordConfirm} = req.body

    //check for same usernames
    db.query('SELECT username FROM users WHERE username = ?', [username], async (error, results) => {
        if(error){
            console.log(error)
        }else
        {
            //check same usernames via array
            if( results.length > 0){
                return res.render('register', {
                    message: "That username is already taken"
                })
            //check password are the same    
            }else if( password !== passwordConfirm){
                return res.render('register', {
                    message: "Password do not match"
                })
            }

            //hashing password using bcrypt 
            const saltRounds = 10
            const salt = await bcrypt.genSalt(saltRounds)
            const hashedPassword = await bcrypt.hash(password, salt)

            db.query('INSERT INTO users SET ?', {first_name: first_name, last_name: last_name, username: username, password: hashedPassword}, (error, resuts) =>{
                if(error){
                    console.log(error)
                }else{
                    console.log(results)
                    return res.render('login',{
                        message: "User Registered"
                    })
                }
            })

        }
    })
}
]

