const mongoose = require('mongoose')

// Populates the .env file properties in this file
const dotenv = require('dotenv');
// Check if the environment is 'test'
if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: __dirname + "../../.env.test"});
} else {
    dotenv.config({ path: __dirname + "../../.env"}) // This will load the default .env file
}

// Set the MongoDB connection
const MONGO_URL = process.env.MONGO_URL

// Event Emitter from mongoose, emits events when the connection is ready
// 'open' event triggers just one time, for that reason we can just .once instead of .on
mongoose.connection.once('open', ()=>{
    console.log('MongoDB connection ready!')
})

// this event triggers for every error in connection to MongoDB
mongoose.connection.on('error', (err) => {
    console.error(err)
})

async function mongoConnect() {
    // mongoose.connect is a Promise
    await mongoose.connect(MONGO_URL)
}

async function mongoDisconnect() {
    await mongoose.disconnect();
  }
  

module.exports = {
    mongoConnect,
    mongoDisconnect,
}