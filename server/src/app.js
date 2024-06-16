const express = require('express');
const cors = require('cors')
const path = require('path')
const morgan = require('morgan')

const api = require('./routes/api')

// Middleware corresponds to this app
// This way we will organize our code a little bit more
const app = express();

// Use a middleware to parse any incoming json, and set our Routers, CORS as well
var whitelist = ['http://localhost:3000', 'http://localhost:8000']
app.use(cors({
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || origin === undefined) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      }
}));

// app.use(cors({
//   origin:"http://localhost:3000"
// }))

// Morgan configuration for LOGS
app.use(morgan('combined'));


app.use(express.json())
// Here we will serve all our public files
// This will be in case to deploy in production
// Express will serve our FE with this line and we will not use React to init it
app.use(express.static(path.join(__dirname, '..', 'public')))

// Middleware to use our Route
// This is to support multiple versions from our API
app.use('/v1', api);

// the * uses the Express matches capabilities, in this case matches everything
// this is to solve an specific problem, at the moment to load the pages through browser
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

module.exports = app;