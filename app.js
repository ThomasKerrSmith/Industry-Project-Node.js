//imports 
const express = require("express")
const path = require("path")
const mysql = require("mysql2")
const session = require('express-session')
const dotenv = require("dotenv")
const bodyParser = require('body-parser')
const crypto = require('crypto');
// const csrf = require('csurf');
// const cookieParser = require('cookie-parser');

const app =  express()
//this hides the response header from potential attackers 
//Attackers knowing your framework allows them to know how your web app has been built  
app.disable('x-powered-by');

//shows location of .env file
dotenv.config({ path: './.env'})

//database connection
const db = mysql.createConnection({
    //environment variables to hide confidential data
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

//create random secret key
const generateSecret = () => {
    const bytes = 32; // Adjust the number of bytes as per your requirements
    return crypto.randomBytes(bytes).toString('hex')
}
const secret = generateSecret();

//config for express sessions 
app.use(session({
    secret: generateSecret(),
    resave: false,
    saveUninitialized: false,
    //httpOnly only prevents client-side JAVASCRIPT to access cookies - reduces chance of (XXS)
    //Secure - True - makes sure cookies are only sent over secure HTTP connections
    cookie: {
      httpOnly: true,
      secure: true
    }
  }));

// app.use(cookieParser());
// app.use(csrf({ cookie: true }));

//css or javasscript front end
//dirname gives access to current directory 
const publicDirectory = path.join(__dirname, './public')
app.use(express.static(publicDirectory))

//Parse URl encoded bodies (as sent by forms)
app.use(express.urlencoded({ extended:false }))
var parseForm = bodyParser.urlencoded({ extended: false })
//Parse JSON bodies (as sent by forms)
app.use(express.json())

//set html templates  
app.set('view engine', 'hbs')

//connect database
db.connect( (error) => {
    if(error){
        console.log(error)
    }else{
        console.log("Mysql Connected")
    }
})

//having toruble with routes so moved this function to app.js to avoid issues with routes
app.get('/showUsers', function (req, res) {

    db.query("SELECT * FROM users ORDER BY id ASC", (error, data) => {
        if (error) {
            console.error('Error executing SQL query:', error);
            throw error;
        } else {
            res.render('showUsers', { action: 'list', userData: data })
        }
    });
})

app.get('/showUsers/edit/:id', function(req, res) {
    var id = req.params.id;
    var query = 'SELECT * FROM users WHERE id = ?'

    db.query(query, [id], function(error, data) {
        if (error) {
            console.error('Error executing SQL query:', error)
            throw error;
        } else {
            res.render('editUser', { title: "Edit User", userData: data[0] })
        }
    })
})

app.post('/editUsers/:id', function(req, res) {
    var id = req.params.id;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var username = req.body.username;
  
    var query = 'UPDATE users SET first_name = ?, last_name = ?, username = ? WHERE id = ?';
    var values = [first_name, last_name, username, id];
  
    db.query(query, values, function(err, data) {
      if (err) {
        throw err;
      } else {
        res.redirect('/showUsers');
      }
    });
  });
  

app.get('/showUsers/delete/:id', function(req, res){

    var id = req.params.id;
    var query = `DELETE FROM users WHERE id = ?`

    db.query(query, [id], function(error, data) {
        if (error) {
            throw error;
        } else {
            res.redirect('/showUsers')
        }
    })
})

//Define routes from router 
//if / - check for pages in routes folder
//if /auht - check for auth in routes folder 
app.use('/', require('./routes/pages'))
app.use('/auth', require('./routes/auth'))

//port route
app.listen(3010, () =>{
    console.log("Server started on port 3000")
})