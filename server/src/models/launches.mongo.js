const mongoose = require('mongoose')

// Construct the schema
const launchesSchema = new mongoose.Schema({
    // flight Number is required and we can add some rules
    flightNumber: {
        type: Number,
        required: true,
        default: 100,
        min: 100,
        max: 999
    },
    launchDate: {
        type: Date,
        required: true
    },
    mission: {
        type: String,
        required: true
    },
    rocket: {
        type: String,
        required: true
    },
    target: {
        // We need to call the logic of Joins in MongoDB
        // Include relevant data from our planets in our launches
        // in this case just the name, which is a String
        type: String
    },
    customers: [ String ],
    upcoming: {
        type: Boolean,
        required: true
    },
    success: {
        type: Boolean,
        required: true,
        default: true
    }
})

// Connects launchesSchema with the "launches" collection
 module.exports = mongoose.model('Launch', launchesSchema)