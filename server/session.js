const mongoose = require("mongoose")
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const db = require('./server/mongoose'); 

app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: db })
}))