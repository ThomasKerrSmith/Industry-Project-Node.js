const mysql = require('mysql2')

const db = mysql.createConnection({
    //environment variables to hide confidential data
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
  
})


