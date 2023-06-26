//this file organises routes to remove clutter form app.js
//import
const express = require('express')
const router = express.Router()

// const csrf = require('csurf');
// const csrfProtection = csrf({ cookie: true });

// router.use(csrfProtection);

//define routes
router.get('/', (req, res) =>{
    res.render("index.hbs")
})

router.get('/register',(req, res) =>{
    res.render("register.hbs")
})

router.get('/login', (req, res) => {
    res.render('login')
});


router.get('/showUsers', (req, res) =>{
    res.render("showUsers.hbs")
})

router.get('/dashboard', (req, res) => {
  res.render('dashboard');
});


module.exports = router;